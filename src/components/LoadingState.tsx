export const LoadingState = ({ label = 'Loading' }: { label?: string }) => (
  <div className="loading-state" role="status">
    <span className="loader" aria-hidden="true" />
    {label}
  </div>
);
