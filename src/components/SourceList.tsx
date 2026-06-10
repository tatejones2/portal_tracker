import type { ResearchSource } from '../types/school';

export const SourceList = ({ sources = [] }: { sources?: ResearchSource[] }) => {
  if (!sources.length) return <p className="muted">No research sources saved yet.</p>;
  return (
    <ul className="source-list">
      {sources.map((source, index) => (
        <li key={`${source.url}-${index}`}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.title || source.url}
          </a>
          {source.fieldSupported ? <span>{source.fieldSupported}</span> : null}
        </li>
      ))}
    </ul>
  );
};
