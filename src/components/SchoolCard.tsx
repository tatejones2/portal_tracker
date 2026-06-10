import { Pencil, Trash2 } from 'lucide-react';
import type { School } from '../types/school';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { formatDriveTime } from '../utils/formatDriveTime';
import { StatusBadge } from './StatusBadge';

type Props = {
  school: School;
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
};

export const SchoolCard = ({ school, onView, onEdit, onDelete }: Props) => (
  <article className="school-card">
    <div className="school-card-header">
      <div className="logo-mark">{school.logoUrl ? <img src={school.logoUrl} alt="" /> : school.name.slice(0, 2).toUpperCase()}</div>
      <div>
        <h3>{school.name}</h3>
        <p>{school.fullLocation || [school.city, school.state].filter(Boolean).join(', ') || 'Location unknown'}</p>
      </div>
    </div>
    <div className="tag-row">
      <StatusBadge status={school.status} />
      {school.offer?.hasOffer || school.status === 'Offer' ? <span className="pill success">Offer</span> : <span className="pill">No offer</span>}
      {school.priority ? <span className={`pill priority-${school.priority.toLowerCase()}`}>{school.priority}</span> : null}
    </div>
    <dl className="mini-grid">
      <div>
        <dt>Conference</dt>
        <dd>{school.baseballConference || 'Unknown'}</dd>
      </div>
      <div>
        <dt>Drive</dt>
        <dd>{formatDriveTime(school.driveTimeFromBurlingtonNC)}</dd>
      </div>
      <div>
        <dt>Undergrad CS</dt>
        <dd>{formatYesNo(school.hasUndergradCS)}</dd>
      </div>
      <div>
        <dt>Grad CS</dt>
        <dd>{formatYesNo(school.hasGradCS)}</dd>
      </div>
      <div>
        <dt>Cost</dt>
        <dd>{formatCurrency(school.estimatedCostOfAttendance)}</dd>
      </div>
      <div>
        <dt>Follow-up</dt>
        <dd>{formatDate(school.nextFollowUpDate)}</dd>
      </div>
    </dl>
    <div className="button-row">
      <button className="button ghost" type="button" onClick={() => onView(school)}>
        View
      </button>
      <button className="icon-button" type="button" onClick={() => onEdit(school)} aria-label={`Edit ${school.name}`}>
        <Pencil size={17} />
      </button>
      <button className="icon-button danger-icon" type="button" onClick={() => onDelete(school)} aria-label={`Delete ${school.name}`}>
        <Trash2 size={17} />
      </button>
    </div>
  </article>
);

export const formatYesNo = (value?: boolean | 'unknown' | 'related') => {
  if (value === true) return 'Yes';
  if (value === 'related') return 'Yes*';
  if (value === false) return 'No';
  return 'Unknown';
};
