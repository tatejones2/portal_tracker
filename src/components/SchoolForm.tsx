import { useState } from 'react';
import type { FormEvent } from 'react';
import { priorities, recruitingStatuses, type School, type UnknownBoolean } from '../types/school';
import { OfferDetailsForm } from './OfferDetailsForm';

type Props = {
  initial?: Partial<School>;
  submitLabel: string;
  onSubmit: (school: Partial<School>) => void;
  onCancel?: () => void;
};

export const SchoolForm = ({ initial = {}, submitLabel, onSubmit, onCancel }: Props) => {
  const [draft, setDraft] = useState<Partial<School>>({
    status: 'Not Contacted',
    priority: 'Medium',
    costTypeUsed: 'unknown',
    hasUndergradCS: 'unknown',
    hasGradCS: 'unknown',
    offer: { hasOffer: false },
    contacts: [],
    ...initial,
  });
  const [error, setError] = useState('');

  const patch = (updates: Partial<School>) => setDraft((current) => ({ ...current, ...updates }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name?.trim()) {
      setError('School name is required.');
      return;
    }
    setError('');
    onSubmit({
      ...draft,
      isWishlist: draft.isWishlist || draft.status === 'Wishlist',
      offer: draft.offer ?? { hasOffer: false },
    });
  };

  return (
    <form className="school-form" onSubmit={handleSubmit}>
      {error ? <p className="form-error">{error}</p> : null}
      <section className="form-section">
        <h2>School overview</h2>
        <div className="form-grid">
          <label>
            School name
            <input required value={draft.name ?? ''} onChange={(event) => patch({ name: event.target.value })} />
          </label>
          <label>
            City
            <input value={draft.city ?? ''} onChange={(event) => patch({ city: event.target.value })} />
          </label>
          <label>
            State
            <input value={draft.state ?? ''} onChange={(event) => patch({ state: event.target.value })} />
          </label>
          <label>
            Full location
            <input value={draft.fullLocation ?? ''} onChange={(event) => patch({ fullLocation: event.target.value })} />
          </label>
          <label>
            School website
            <input type="url" value={draft.schoolWebsite ?? ''} onChange={(event) => patch({ schoolWebsite: event.target.value })} />
          </label>
          <label>
            Athletics website
            <input type="url" value={draft.athleticsWebsite ?? ''} onChange={(event) => patch({ athleticsWebsite: event.target.value })} />
          </label>
          <label>
            Status
            <select value={draft.status} onChange={(event) => patch({ status: event.target.value as School['status'] })}>
              {recruitingStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={draft.priority ?? 'Medium'} onChange={(event) => patch({ priority: event.target.value as School['priority'] })}>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label className="check wide">
            <input type="checkbox" checked={Boolean(draft.isWishlist)} onChange={(event) => patch({ isWishlist: event.target.checked })} />
            Keep on wishlist/watchlist
          </label>
        </div>
      </section>

      <section className="form-section">
        <h2>Academics and cost</h2>
        <div className="form-grid">
          <label>
            Estimated cost of attendance
            <input type="number" value={draft.estimatedCostOfAttendance ?? ''} onChange={(event) => patchNumber('estimatedCostOfAttendance', event.target.value, patch)} />
          </label>
          <label>
            In-state tuition
            <input type="number" value={draft.tuitionInState ?? ''} onChange={(event) => patchNumber('tuitionInState', event.target.value, patch)} />
          </label>
          <label>
            Out-of-state tuition
            <input type="number" value={draft.tuitionOutOfState ?? ''} onChange={(event) => patchNumber('tuitionOutOfState', event.target.value, patch)} />
          </label>
          <label>
            Cost type
            <select value={draft.costTypeUsed ?? 'unknown'} onChange={(event) => patch({ costTypeUsed: event.target.value as School['costTypeUsed'] })}>
              <option value="unknown">Unknown</option>
              <option value="in-state">In-state</option>
              <option value="out-of-state">Out-of-state</option>
            </select>
          </label>
          <label>
            Undergrad CS
            <select value={String(draft.hasUndergradCS ?? 'unknown')} onChange={(event) => patch({ hasUndergradCS: parseUnknownBoolean(event.target.value) })}>
              <option value="unknown">Unknown</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label>
            Undergrad program
            <input value={draft.undergradCSProgramName ?? ''} onChange={(event) => patch({ undergradCSProgramName: event.target.value })} />
          </label>
          <label>
            Undergrad CS URL
            <input type="url" value={draft.undergradCSUrl ?? ''} onChange={(event) => patch({ undergradCSUrl: event.target.value })} />
          </label>
          <label>
            Grad CS
            <select value={String(draft.hasGradCS ?? 'unknown')} onChange={(event) => patch({ hasGradCS: parseCSAvailability(event.target.value) })}>
              <option value="unknown">Unknown</option>
              <option value="true">Yes</option>
              <option value="related">Yes* related program</option>
              <option value="false">No</option>
            </select>
          </label>
          <label>
            Grad program
            <input value={draft.gradCSProgramName ?? ''} onChange={(event) => patch({ gradCSProgramName: event.target.value })} />
          </label>
          <label>
            Grad CS URL
            <input type="url" value={draft.gradCSUrl ?? ''} onChange={(event) => patch({ gradCSUrl: event.target.value })} />
          </label>
          <label className="wide">
            Cost notes
            <textarea value={draft.costNotes ?? ''} onChange={(event) => patch({ costNotes: event.target.value })} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <h2>Baseball and travel</h2>
        <div className="form-grid">
          <label>
            Baseball conference
            <input value={draft.baseballConference ?? ''} onChange={(event) => patch({ baseballConference: event.target.value })} />
          </label>
          <label>
            Baseball division
            <input value={draft.baseballDivision ?? ''} onChange={(event) => patch({ baseballDivision: event.target.value })} />
          </label>
          <label>
            2026 record
            <input value={draft.baseball2026Record ?? ''} onChange={(event) => patch({ baseball2026Record: event.target.value })} />
          </label>
          <label>
            Record source URL
            <input type="url" value={draft.baseballRecordSourceUrl ?? ''} onChange={(event) => patch({ baseballRecordSourceUrl: event.target.value })} />
          </label>
          <label>
            Drive time
            <input value={draft.driveTimeFromBurlingtonNC ?? ''} onChange={(event) => patch({ driveTimeFromBurlingtonNC: event.target.value })} />
          </label>
          <label>
            Drive distance
            <input value={draft.driveDistanceFromBurlingtonNC ?? ''} onChange={(event) => patch({ driveDistanceFromBurlingtonNC: event.target.value })} />
          </label>
          <label>
            Maps URL
            <input type="url" value={draft.mapsUrl ?? ''} onChange={(event) => patch({ mapsUrl: event.target.value })} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <h2>Recruiting notes</h2>
        <div className="form-grid">
          <label>
            Last contact
            <input type="date" value={draft.lastContactDate ?? ''} onChange={(event) => patch({ lastContactDate: event.target.value })} />
          </label>
          <label>
            Next follow-up
            <input type="date" value={draft.nextFollowUpDate ?? ''} onChange={(event) => patch({ nextFollowUpDate: event.target.value })} />
          </label>
          <label className="wide">
            Notes
            <textarea value={draft.notes ?? ''} onChange={(event) => patch({ notes: event.target.value })} />
          </label>
          <label className="wide">
            AI research summary
            <textarea value={draft.aiResearchSummary ?? ''} onChange={(event) => patch({ aiResearchSummary: event.target.value })} />
          </label>
        </div>
      </section>

      <OfferDetailsForm value={draft.offer ?? { hasOffer: false }} onChange={(offer) => patch({ offer })} />

      <div className="button-row sticky-actions">
        {onCancel ? (
          <button className="button ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="button primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const parseUnknownBoolean = (value: string): UnknownBoolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return 'unknown';
};

const parseCSAvailability = (value: string) => {
  if (value === 'related') return 'related';
  return parseUnknownBoolean(value);
};

const patchNumber = (field: keyof School, value: string, patch: (updates: Partial<School>) => void) => {
  patch({ [field]: value === '' ? undefined : Number(value) } as Partial<School>);
};
