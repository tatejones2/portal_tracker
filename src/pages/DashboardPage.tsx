import { Plus } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { EmptyState } from '../components/EmptyState';
import { SchoolCard } from '../components/SchoolCard';
import type { School } from '../types/school';
import { needsFollowUp } from '../utils/filterSchools';

type Props = {
  schools: School[];
  onAdd: () => void;
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
};

export const DashboardPage = ({ schools, onAdd, onView, onEdit, onDelete }: Props) => {
  const offers = schools.filter((school) => school.offer?.hasOffer || school.status === 'Offer');
  const followUps = schools.filter(needsFollowUp).slice(0, 4);
  const recent = [...schools].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const closest = schools.find((school) => school.driveTimeFromBurlingtonNC);
  const latest = [...schools].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const statusCounts = schools.reduce<Record<string, number>>((acc, school) => {
    acc[school.status] = (acc[school.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Private recruiting dashboard</p>
          <h2>Know exactly where every school stands.</h2>
          <p>Track conversations, offers, academic fit, baseball fit, cost, travel, and follow-up from one polished board.</p>
        </div>
        <button className="button primary" type="button" onClick={onAdd}>
          <Plus size={18} /> Add School
        </button>
      </section>

      <section className="metric-grid">
        <DashboardCard label="Total schools" value={schools.length} />
        <DashboardCard label="Offers" value={offers.length} />
        <DashboardCard label="Pending response" value={schools.filter((s) => s.status === 'Pending Response').length} />
        <DashboardCard label="Texting" value={schools.filter((s) => s.status === 'Texting').length} />
        <DashboardCard label="Calls scheduled" value={schools.filter((s) => s.status === 'Call Scheduled').length} />
        <DashboardCard label="Visits scheduled" value={schools.filter((s) => s.status === 'Visit Scheduled').length} />
        <DashboardCard label="Undergrad CS" value={schools.filter((s) => s.hasUndergradCS === true).length} />
        <DashboardCard label="Grad CS" value={schools.filter((s) => s.hasGradCS === true).length} />
        <DashboardCard label="Closest noted" value={closest?.name ?? 'Unknown'} detail={closest?.driveTimeFromBurlingtonNC} />
        <DashboardCard label="Most recent" value={latest?.name ?? 'None yet'} />
      </section>

      <section className="two-column">
        <div className="panel">
          <h2>Status breakdown</h2>
          <div className="status-bars">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}>
                <span>{status}</span>
                <div><i style={{ width: `${Math.max(8, (count / Math.max(1, schools.length)) * 100)}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Needs follow-up</h2>
          {followUps.length ? (
            <div className="compact-list">
              {followUps.map((school) => <SchoolCard key={school.id} school={school} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}
            </div>
          ) : (
            <EmptyState title="Nothing urgent" body="Schools marked pending, stale texting, due follow-ups, and high priority schools will appear here." />
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Recently updated</h2>
        {recent.length ? (
          <div className="card-grid">
            {recent.map((school) => <SchoolCard key={school.id} school={school} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        ) : (
          <EmptyState title="No schools yet" body="Add your first school to start tracking your portal process." />
        )}
      </section>
    </div>
  );
};
