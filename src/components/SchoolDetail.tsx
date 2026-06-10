import { ExternalLink, X } from 'lucide-react';
import type { School } from '../types/school';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { formatDriveTime } from '../utils/formatDriveTime';
import { SourceList } from './SourceList';
import { StatusBadge } from './StatusBadge';
import { formatYesNo } from './SchoolCard';

type Props = {
  school: School | null;
  onClose: () => void;
  onEdit: (school: School) => void;
};

export const SchoolDetail = ({ school, onClose, onEdit }: Props) => {
  if (!school) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <article className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header className="detail-header">
          <div>
            <p className="eyebrow">School detail</p>
            <h2 id="detail-title">{school.name}</h2>
            <p>{school.fullLocation || [school.city, school.state].filter(Boolean).join(', ') || 'Location unknown'}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close detail">
            <X size={20} />
          </button>
        </header>
        <div className="tag-row">
          <StatusBadge status={school.status} />
          {school.offer?.hasOffer || school.status === 'Offer' ? <span className="pill success">Offer</span> : <span className="pill">No offer</span>}
          {school.confidence ? <span className="pill">AI confidence: {school.confidence}</span> : null}
        </div>

        <div className="detail-grid">
          <Section title="Overview">
            <Fact label="Priority" value={school.priority || 'Medium'} />
            <Fact label="Last contact" value={formatDate(school.lastContactDate)} />
            <Fact label="Next follow-up" value={formatDate(school.nextFollowUpDate)} />
            <Links school={school} />
          </Section>
          <Section title="Offer Details">
            <Fact label="Has offer" value={school.offer?.hasOffer ? 'Yes' : 'No'} />
            <Fact label="Scholarship" value={school.offer?.scholarshipType || 'Unknown'} />
            <Fact label="Amount" value={school.offer?.scholarshipAmount || 'Unknown'} />
            <Fact label="Roster role" value={school.offer?.rosterRole || 'Unknown'} />
            <Fact label="Pitching role" value={school.offer?.pitchingRole || 'Unknown'} />
            <Fact label="Deadline" value={formatDate(school.offer?.deadline)} />
          </Section>
          <Section title="Academics">
            <Fact label="Undergrad CS" value={formatYesNo(school.hasUndergradCS)} />
            <Fact label="Undergrad program" value={school.undergradCSProgramName || 'Unknown'} />
            <Fact label="Grad CS" value={formatYesNo(school.hasGradCS)} />
            <Fact label="Grad program" value={school.gradCSProgramName || 'Unknown'} />
          </Section>
          <Section title="Baseball Program">
            <Fact label="Conference" value={school.baseballConference || 'Unknown'} />
            <Fact label="Division" value={school.baseballDivision || 'Unknown'} />
            <Fact label="2026 record" value={school.baseball2026Record || 'Unknown'} />
          </Section>
          <Section title="Cost / Financial Info">
            <Fact label="Cost of attendance" value={formatCurrency(school.estimatedCostOfAttendance)} />
            <Fact label="In-state tuition" value={formatCurrency(school.tuitionInState)} />
            <Fact label="Out-of-state tuition" value={formatCurrency(school.tuitionOutOfState)} />
            <p>{school.costNotes || 'No cost notes saved.'}</p>
          </Section>
          <Section title="Travel Info">
            <Fact label="Drive time" value={formatDriveTime(school.driveTimeFromBurlingtonNC)} />
            <Fact label="Drive distance" value={school.driveDistanceFromBurlingtonNC || 'Unknown'} />
            {school.mapsUrl ? <a href={school.mapsUrl} target="_blank" rel="noreferrer">Open map <ExternalLink size={14} /></a> : null}
          </Section>
          <Section title="Contacts">
            {school.contacts?.length ? (
              school.contacts.map((contact) => (
                <p key={contact.id}><strong>{contact.name || 'Unnamed contact'}</strong> {contact.role ? `- ${contact.role}` : ''}</p>
              ))
            ) : (
              <p>No contacts saved yet.</p>
            )}
          </Section>
          <Section title="Notes">
            <p>{school.notes || 'No notes saved yet.'}</p>
            {school.aiResearchSummary ? <p className="muted">{school.aiResearchSummary}</p> : null}
          </Section>
          <Section title="AI Research Sources">
            <SourceList sources={school.aiSources} />
          </Section>
        </div>
        <div className="button-row sticky-actions">
          <button className="button ghost" type="button" onClick={onClose}>Close</button>
          <button className="button primary" type="button" onClick={() => onEdit(school)}>Edit School</button>
        </div>
      </article>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="detail-section">
    <h3>{title}</h3>
    {children}
  </section>
);

const Fact = ({ label, value }: { label: string; value: string }) => (
  <p className="fact"><span>{label}</span><strong>{value}</strong></p>
);

const Links = ({ school }: { school: School }) => (
  <div className="link-stack">
    {school.schoolWebsite ? <a href={school.schoolWebsite} target="_blank" rel="noreferrer">School website <ExternalLink size={14} /></a> : null}
    {school.athleticsWebsite ? <a href={school.athleticsWebsite} target="_blank" rel="noreferrer">Athletics website <ExternalLink size={14} /></a> : null}
  </div>
);
