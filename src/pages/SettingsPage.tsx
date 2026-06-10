import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { School } from '../types/school';

type Props = {
  schools: School[];
  homeLocation: string;
  academicInterest: string;
  onHomeLocationChange: (value: string) => void;
  onAcademicInterestChange: (value: string) => void;
  onReplace: (schools: School[]) => Promise<void>;
  onMerge: (schools: School[]) => Promise<void>;
  onClear: () => Promise<void>;
};

export const SettingsPage = ({ schools, homeLocation, academicInterest, onHomeLocationChange, onAcademicInterestChange, onReplace, onMerge, onClear }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<School[] | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [message, setMessage] = useState('');

  const exportData = () => {
    const blob = new Blob([JSON.stringify(schools, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `portal-board-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.some((item) => !item.name)) {
        throw new Error('Import file must be a JSON array of schools with names.');
      }
      setPendingImport(parsed as School[]);
      setMessage('');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Import failed.');
    }
  };

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Preferences and data</p>
          <h2>Settings</h2>
          <p>Manage defaults, export/import local data, and check AI availability.</p>
        </div>
      </section>
      <section className="panel settings-grid">
        <label>
          Player home location
          <input value={homeLocation} onChange={(event) => onHomeLocationChange(event.target.value)} />
        </label>
        <label>
          Academic interest
          <input value={academicInterest} onChange={(event) => onAcademicInterestChange(event.target.value)} />
        </label>
        <div className="api-status">
          <span className="status-dot" aria-hidden="true" />
          AI endpoint configured as <code>/api/research-school</code>
        </div>
      </section>

      <section className="panel">
        <h2>Data management</h2>
        <p className="muted">Data is currently stored locally in this browser under <code>portal-board-schools</code>.</p>
        <div className="button-row">
          <button className="button primary" type="button" onClick={exportData}><Download size={18} /> Export JSON</button>
          <button className="button secondary" type="button" onClick={() => inputRef.current?.click()}><Upload size={18} /> Import JSON</button>
          <button className="button danger" type="button" onClick={() => setClearOpen(true)}>Clear all local data</button>
        </div>
        <input ref={inputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
        {message ? <p className="form-error">{message}</p> : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="Import schools?"
        body={`Import ${pendingImport?.length ?? 0} schools. Choose Delete to replace existing data, or Cancel and use merge from the inline controls.`}
        confirmLabel="Replace"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          if (pendingImport) void onReplace(pendingImport);
          setPendingImport(null);
        }}
      />
      {pendingImport ? (
        <div className="floating-import">
          <span>{pendingImport.length} schools ready to import</span>
          <button className="button secondary" type="button" onClick={() => { void onMerge(pendingImport); setPendingImport(null); }}>Merge</button>
        </div>
      ) : null}
      <ConfirmDialog
        open={clearOpen}
        title="Clear all local data?"
        body="This removes every saved school from this browser. Export first if you need a backup."
        confirmLabel="Clear Data"
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          void onClear();
          setClearOpen(false);
        }}
      />
    </div>
  );
};
