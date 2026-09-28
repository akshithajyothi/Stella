const Spinner = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="spinner-wrap" role="status" aria-live="polite">
    <div className="tryon-spinner"></div>
    <span>{label}</span>
  </div>
);

export default Spinner;
