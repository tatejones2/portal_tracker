import { EmptyState } from '../components/EmptyState';
import { SchoolCard } from '../components/SchoolCard';
import type { School } from '../types/school';

type Props = {
  schools: School[];
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
};

export const OffersPage = ({ schools, onView, onEdit, onDelete }: Props) => {
  const offers = schools.filter((school) => school.offer?.hasOffer || school.status === 'Offer');
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Offer board</p>
          <h2>Offers</h2>
          <p>Scholarship, roster role, academic, deadline, and note details for active offers.</p>
        </div>
      </section>
      {offers.length ? (
        <div className="card-grid">
          {offers.map((school) => <SchoolCard key={school.id} school={school} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      ) : (
        <EmptyState title="No offers yet" body="Offers will appear here once you mark a school as offered." />
      )}
    </div>
  );
};
