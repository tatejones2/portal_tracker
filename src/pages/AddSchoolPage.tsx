import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { researchSchool } from '../api/researchSchool';
import { LoadingState } from '../components/LoadingState';
import { SchoolForm } from '../components/SchoolForm';
import type { School } from '../types/school';

type Props = {
  homeLocation: string;
  academicInterest: string;
  onCreate: (school: Partial<School>) => Promise<void>;
};

export const AddSchoolPage = ({ homeLocation, academicInterest, onCreate }: Props) => {
  const [schoolName, setSchoolName] = useState('');
  const [researchResult, setResearchResult] = useState<Partial<School> | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState('');

  const runResearch = async () => {
    if (!schoolName.trim()) {
      setError('Enter a school name before researching.');
      return;
    }
    setIsResearching(true);
    setError('');
    try {
      const result = await researchSchool({ schoolName, homeLocation, academicInterest });
      const draft = {
        ...result,
        name: result.name || schoolName,
        status: result.status || 'Not Contacted',
        confidence: result.confidence || 'Low',
      } as Partial<School>;
      setResearchResult(draft);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'School research could not be completed. You can try again or add the school manually.');
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Add school</p>
          <h2>Research or enter a school manually</h2>
          <p>AI-filled information should be reviewed for accuracy before relying on it.</p>
        </div>
      </section>

      <section className="panel research-panel">
        <div>
          <h2>AI Research Add</h2>
          <p className="muted">Uses the server-side API route. The OpenAI key is never exposed in the browser bundle.</p>
        </div>
        <label>
          School name
          <input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="East Tennessee State University" />
        </label>
        <div className="button-row">
          <button className="button primary" type="button" onClick={() => void runResearch()} disabled={isResearching}>
            <Sparkles size={18} /> Research School
          </button>
          <button className="button secondary" type="button" onClick={() => void runResearch()} disabled={isResearching}>
            Research & Add
          </button>
        </div>
        {isResearching ? <LoadingState label="Researching school" /> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </section>

      {researchResult ? (
        <section className="panel">
          <h2>Review AI-filled result</h2>
          <p className="notice">AI-filled information should be reviewed for accuracy before relying on it.</p>
          <SchoolForm
            initial={researchResult}
            submitLabel="Save School"
            onSubmit={(school) => {
              void onCreate(school);
              setResearchResult(null);
              setSchoolName('');
            }}
            onCancel={() => setResearchResult(null)}
          />
        </section>
      ) : (
        <section className="panel">
          <h2>Manual Add</h2>
          <SchoolForm submitLabel="Save School" onSubmit={(school) => void onCreate(school)} />
        </section>
      )}
    </div>
  );
};
