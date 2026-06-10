import { ArrowDownUp, Pencil, Trash2 } from 'lucide-react';
import type { School } from '../types/school';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { formatDriveTime } from '../utils/formatDriveTime';
import type { SortDirection, SortKey } from '../utils/sortSchools';
import { StatusBadge } from './StatusBadge';
import { formatYesNo } from './SchoolCard';

type Props = {
  schools: School[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
};

const columns: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'School' },
  { key: 'status', label: 'Status' },
  { key: 'offer', label: 'Offer' },
  { key: 'cost', label: 'Cost' },
  { key: 'undergradCS', label: 'Undergrad CS' },
  { key: 'gradCS', label: 'Grad CS' },
  { key: 'conference', label: 'Conference' },
  { key: 'record', label: '2026 Record' },
  { key: 'driveTime', label: 'Drive' },
  { key: 'lastContactDate', label: 'Last Contact' },
  { key: 'priority', label: 'Priority' },
];

export const SchoolTable = ({ schools, sortKey, sortDirection, onSort, onView, onEdit, onDelete }: Props) => (
  <div className="table-wrap">
    <table className="school-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>
              <button type="button" onClick={() => onSort(column.key)}>
                {column.label}
                <ArrowDownUp size={14} aria-hidden="true" />
                <span className="sr-only">
                  {sortKey === column.key ? `Sorted ${sortDirection}` : 'Sort column'}
                </span>
              </button>
            </th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {schools.map((school) => (
          <tr key={school.id}>
            <td>
              <button className="school-name-button" type="button" onClick={() => onView(school)}>
                <span className="logo-mark small">{school.logoUrl ? <img src={school.logoUrl} alt="" /> : school.name.slice(0, 2).toUpperCase()}</span>
                <span>
                  <strong>{school.name}</strong>
                  <small>{school.fullLocation || [school.city, school.state].filter(Boolean).join(', ') || 'Location unknown'}</small>
                </span>
              </button>
            </td>
            <td><StatusBadge status={school.status} /></td>
            <td>{school.offer?.hasOffer || school.status === 'Offer' ? 'Yes' : 'No'}</td>
            <td>{formatCurrency(school.estimatedCostOfAttendance)}</td>
            <td>{formatYesNo(school.hasUndergradCS)}</td>
            <td>{formatYesNo(school.hasGradCS)}</td>
            <td>{school.baseballConference || 'Unknown'}</td>
            <td>{school.baseball2026Record || 'Unknown'}</td>
            <td>{formatDriveTime(school.driveTimeFromBurlingtonNC)}</td>
            <td>{formatDate(school.lastContactDate)}</td>
            <td>{school.priority || 'Medium'}</td>
            <td>
              <div className="button-row compact">
                <button className="button ghost" type="button" onClick={() => onView(school)}>View</button>
                <button className="icon-button" type="button" onClick={() => onEdit(school)} aria-label={`Edit ${school.name}`}>
                  <Pencil size={16} />
                </button>
                <button className="icon-button danger-icon" type="button" onClick={() => onDelete(school)} aria-label={`Delete ${school.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
