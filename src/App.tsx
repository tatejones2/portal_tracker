import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LoadingState } from './components/LoadingState';
import { SchoolDetail } from './components/SchoolDetail';
import { SchoolForm } from './components/SchoolForm';
import { useSchools } from './hooks/useSchools';
import { AddSchoolPage } from './pages/AddSchoolPage';
import { DashboardPage } from './pages/DashboardPage';
import { OffersPage } from './pages/OffersPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WishlistPage } from './pages/WishlistPage';
import type { School } from './types/school';

export type View = 'dashboard' | 'schools' | 'add' | 'offers' | 'wishlist' | 'settings';

const SETTINGS_KEY = 'portal-board-settings';

type Settings = {
  homeLocation: string;
  academicInterest: string;
};

const readSettings = (): Settings => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      homeLocation: parsed.homeLocation || 'Burlington, North Carolina',
      academicInterest: parsed.academicInterest || 'Computer Science',
    };
  } catch {
    return { homeLocation: 'Burlington, North Carolina', academicInterest: 'Computer Science' };
  }
};

function App() {
  const { schools, isLoading, create, update, remove, replaceAll, merge, clear } = useSchools();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [settings, setSettings] = useState(readSettings);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [pendingDelete, setPendingDelete] = useState<School | null>(null);

  const commonHandlers = useMemo(
    () => ({
      onView: setSelectedSchool,
      onEdit: (school: School) => {
        setEditingSchool(school);
        setSelectedSchool(null);
      },
      onDelete: setPendingDelete,
    }),
    [],
  );

  const saveSettings = (updates: Partial<Settings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const handleCreate = async (school: Partial<School>) => {
    await create(school);
    setActiveView('schools');
  };

  const renderPage = () => {
    if (isLoading) return <LoadingState label="Loading Portal Board" />;

    switch (activeView) {
      case 'schools':
        return <SchoolsPage schools={schools} onAdd={() => setActiveView('add')} {...commonHandlers} />;
      case 'add':
        return <AddSchoolPage homeLocation={settings.homeLocation} academicInterest={settings.academicInterest} onCreate={handleCreate} />;
      case 'offers':
        return <OffersPage schools={schools} {...commonHandlers} />;
      case 'wishlist':
        return <WishlistPage schools={schools} {...commonHandlers} />;
      case 'settings':
        return (
          <SettingsPage
            schools={schools}
            homeLocation={settings.homeLocation}
            academicInterest={settings.academicInterest}
            onHomeLocationChange={(homeLocation) => saveSettings({ homeLocation })}
            onAcademicInterestChange={(academicInterest) => saveSettings({ academicInterest })}
            onReplace={replaceAll}
            onMerge={merge}
            onClear={clear}
          />
        );
      case 'dashboard':
      default:
        return <DashboardPage schools={schools} onAdd={() => setActiveView('add')} {...commonHandlers} />;
    }
  };

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {renderPage()}
      <SchoolDetail school={selectedSchool} onClose={() => setSelectedSchool(null)} onEdit={(school) => setEditingSchool(school)} />
      {editingSchool ? (
        <div className="modal-backdrop" role="presentation">
          <article className="edit-panel" role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <h2 id="edit-title">Edit {editingSchool.name}</h2>
            <SchoolForm
              initial={editingSchool}
              submitLabel="Save Changes"
              onCancel={() => setEditingSchool(null)}
              onSubmit={(updates) => {
                void update(editingSchool.id, updates);
                setEditingSchool(null);
              }}
            />
          </article>
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete school?"
        body={`Delete ${pendingDelete?.name ?? 'this school'} from the board? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </AppShell>
  );
}

export default App;
