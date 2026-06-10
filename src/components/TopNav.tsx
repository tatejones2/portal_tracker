import { BarChart3, Heart, ListPlus, Medal, School, Settings } from 'lucide-react';
import type { View } from '../App';

const items: Array<{ view: View; label: string; icon: typeof BarChart3 }> = [
  { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { view: 'schools', label: 'Schools', icon: School },
  { view: 'add', label: 'Add School', icon: ListPlus },
  { view: 'offers', label: 'Offers', icon: Medal },
  { view: 'wishlist', label: 'Watchlist', icon: Heart },
  { view: 'settings', label: 'Settings', icon: Settings },
];

type Props = {
  activeView: View;
  onNavigate: (view: View) => void;
};

export const TopNav = ({ activeView, onNavigate }: Props) => (
  <nav className="top-nav" aria-label="Primary navigation">
    {items.map(({ view, label, icon: Icon }) => (
      <button
        className={activeView === view ? 'active' : ''}
        key={view}
        type="button"
        onClick={() => onNavigate(view)}
      >
        <Icon size={17} aria-hidden="true" />
        <span>{label}</span>
      </button>
    ))}
  </nav>
);
