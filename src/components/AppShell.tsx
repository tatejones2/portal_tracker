import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import type { View } from '../App';

type Props = {
  activeView: View;
  onNavigate: (view: View) => void;
  children: ReactNode;
};

export const AppShell = ({ activeView, onNavigate, children }: Props) => (
  <div className="app-shell">
    <header className="app-header">
      <div>
        <p className="eyebrow">Transfer Portal Tracker</p>
        <h1>Portal Board</h1>
      </div>
      <TopNav activeView={activeView} onNavigate={onNavigate} />
    </header>
    <main>{children}</main>
  </div>
);
