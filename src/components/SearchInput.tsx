import { Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput = ({ value, onChange }: Props) => (
  <label className="search-input">
    <Search size={18} aria-hidden="true" />
    <span className="sr-only">Search schools</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search schools, conferences, notes, contacts"
    />
  </label>
);
