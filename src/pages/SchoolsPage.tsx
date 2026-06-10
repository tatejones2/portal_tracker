import { LayoutGrid, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { FilterBar } from '../components/FilterBar';
import { SchoolCard } from '../components/SchoolCard';
import { SchoolTable } from '../components/SchoolTable';
import type { School } from '../types/school';
import { defaultFilters, filterSchools } from '../utils/filterSchools';
import { sortSchools, type SortDirection, type SortKey } from '../utils/sortSchools';

type Props = {
  schools: School[];
  onAdd: () => void;
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
};

export const SchoolsPage = ({ schools, onAdd, onView, onEdit, onDelete }: Props) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [pendingDelete, setPendingDelete] = useState<School | null>(null);
  const conferences = useMemo(
    () => Array.from(new Set(schools.map((school) => school.baseballConference).filter(Boolean) as string[])).sort(),
    [schools],
  );
  const visibleSchools = useMemo(() => sortSchools(filterSchools(schools, filters), sortKey, sortDirection), [schools, filters, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">School collection</p>
          <h2>Schools</h2>
          <p>{visibleSchools.length} of {schools.length} schools shown</p>
        </div>
        <div className="button-row">
          <button className={`icon-button ${viewMode === 'table' ? 'active' : ''}`} type="button" onClick={() => setViewMode('table')} aria-label="Table view"><Table2 size={18} /></button>
          <button className={`icon-button ${viewMode === 'grid' ? 'active' : ''}`} type="button" onClick={() => setViewMode('grid')} aria-label="Grid view"><LayoutGrid size={18} /></button>
          <button className="button primary" type="button" onClick={onAdd}>Add School</button>
        </div>
      </section>
      <FilterBar filters={filters} conferences={conferences} onChange={setFilters} />
      {visibleSchools.length ? (
        viewMode === 'table' ? (
          <SchoolTable schools={visibleSchools} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} onView={onView} onEdit={onEdit} onDelete={setPendingDelete} />
        ) : (
          <div className="card-grid">
            {visibleSchools.map((school) => <SchoolCard key={school.id} school={school} onView={onView} onEdit={onEdit} onDelete={setPendingDelete} />)}
          </div>
        )
      ) : (
        <EmptyState title="No schools match" body="Adjust the search or filters, or add a new school to the board." action={<button className="button primary" type="button" onClick={onAdd}>Add School</button>} />
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete school?"
        body={`Delete ${pendingDelete?.name ?? 'this school'} from the board? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
};
