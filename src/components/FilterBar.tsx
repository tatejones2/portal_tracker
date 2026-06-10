import type { SchoolFilters } from '../utils/filterSchools';
import { priorities, recruitingStatuses } from '../types/school';
import { SearchInput } from './SearchInput';

type Props = {
  filters: SchoolFilters;
  conferences: string[];
  onChange: (filters: SchoolFilters) => void;
};

export const FilterBar = ({ filters, conferences, onChange }: Props) => {
  const patch = (updates: Partial<SchoolFilters>) => onChange({ ...filters, ...updates });

  return (
    <section className="filter-bar" aria-label="School filters">
      <SearchInput value={filters.query} onChange={(query) => patch({ query })} />
      <div className="filter-grid">
        <label>
          Status
          <select value={filters.status} onChange={(event) => patch({ status: event.target.value as SchoolFilters['status'] })}>
            <option value="all">All statuses</option>
            {recruitingStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Offer
          <select value={filters.offer} onChange={(event) => patch({ offer: event.target.value as SchoolFilters['offer'] })}>
            <option value="all">All</option>
            <option value="yes">Offers only</option>
            <option value="no">No offer</option>
          </select>
        </label>
        <label>
          Undergrad CS
          <select
            value={String(filters.undergradCS)}
            onChange={(event) => patch({ undergradCS: parseBooleanFilter(event.target.value) })}
          >
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>
          Grad CS
          <select value={String(filters.gradCS)} onChange={(event) => patch({ gradCS: parseBooleanFilter(event.target.value) })}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>
          Priority
          <select value={filters.priority} onChange={(event) => patch({ priority: event.target.value as SchoolFilters['priority'] })}>
            <option value="all">All</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label>
          Conference
          <select value={filters.conference} onChange={(event) => patch({ conference: event.target.value })}>
            <option value="all">All conferences</option>
            {conferences.map((conference) => (
              <option key={conference} value={conference}>
                {conference}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="toggle-row">
        <label className="check">
          <input type="checkbox" checked={filters.wishlistOnly} onChange={(event) => patch({ wishlistOnly: event.target.checked })} />
          Wishlist only
        </label>
        <label className="check">
          <input type="checkbox" checked={filters.needsFollowUp} onChange={(event) => patch({ needsFollowUp: event.target.checked })} />
          Needs follow-up
        </label>
      </div>
    </section>
  );
};

const parseBooleanFilter = (value: string): SchoolFilters['undergradCS'] => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value as SchoolFilters['undergradCS'];
};
