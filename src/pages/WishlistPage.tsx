import { EmptyState } from '../components/EmptyState';
import { SchoolCard } from '../components/SchoolCard';
import type { School } from '../types/school';

type Props = {
  schools: School[];
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
};

export const WishlistPage = ({ schools, onView, onEdit, onDelete }: Props) => {
  const wishlist = schools.filter((school) => school.isWishlist || school.status === 'Wishlist');
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Future targets</p>
          <h2>Wishlist / Watchlist</h2>
          <p>Schools worth monitoring before active conversations begin.</p>
        </div>
      </section>
      {wishlist.length ? (
        <div className="card-grid">
          {wishlist.map((school) => <SchoolCard key={school.id} school={school} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      ) : (
        <EmptyState title="No wishlist schools" body="Add schools to your wishlist to track future opportunities." />
      )}
    </div>
  );
};
