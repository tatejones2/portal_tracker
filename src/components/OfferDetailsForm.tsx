import type { OfferDetails } from '../types/school';

type Props = {
  value: OfferDetails;
  onChange: (value: OfferDetails) => void;
};

export const OfferDetailsForm = ({ value, onChange }: Props) => {
  const patch = (updates: Partial<OfferDetails>) => onChange({ ...value, ...updates });

  return (
    <details className="form-section" open={value.hasOffer}>
      <summary>Offer details</summary>
      <div className="form-grid">
        <label className="check wide">
          <input type="checkbox" checked={value.hasOffer} onChange={(event) => patch({ hasOffer: event.target.checked })} />
          Has offer
        </label>
        <label>
          Offer date
          <input type="date" value={value.offerDate ?? ''} onChange={(event) => patch({ offerDate: event.target.value })} />
        </label>
        <label>
          Scholarship type
          <select value={value.scholarshipType ?? 'Unknown'} onChange={(event) => patch({ scholarshipType: event.target.value as OfferDetails['scholarshipType'] })}>
            <option>Unknown</option>
            <option>Full</option>
            <option>Partial</option>
            <option>Walk-on</option>
          </select>
        </label>
        <label>
          Scholarship amount
          <input value={value.scholarshipAmount ?? ''} onChange={(event) => patch({ scholarshipAmount: event.target.value })} />
        </label>
        <label>
          Academic aid
          <input value={value.academicAid ?? ''} onChange={(event) => patch({ academicAid: event.target.value })} />
        </label>
        <label>
          Roster role
          <input value={value.rosterRole ?? ''} onChange={(event) => patch({ rosterRole: event.target.value })} />
        </label>
        <label>
          Pitching role
          <input value={value.pitchingRole ?? ''} onChange={(event) => patch({ pitchingRole: event.target.value })} />
        </label>
        <label>
          Deadline
          <input type="date" value={value.deadline ?? ''} onChange={(event) => patch({ deadline: event.target.value })} />
        </label>
        <label>
          Housing
          <select value={String(value.housingIncluded ?? 'unknown')} onChange={(event) => patch({ housingIncluded: parseUnknownBoolean(event.target.value) })}>
            <option value="unknown">Unknown</option>
            <option value="true">Included</option>
            <option value="false">Not included</option>
          </select>
        </label>
        <label className="wide">
          Important conditions
          <textarea value={value.importantConditions ?? ''} onChange={(event) => patch({ importantConditions: event.target.value })} />
        </label>
        <label className="wide">
          Offer notes
          <textarea value={value.notes ?? ''} onChange={(event) => patch({ notes: event.target.value })} />
        </label>
      </div>
    </details>
  );
};

const parseUnknownBoolean = (value: string) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return 'unknown';
};
