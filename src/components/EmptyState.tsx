import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

const EmptyState = ({ icon = 'fa-solid fa-box-open', title, message, actionLabel, actionTo }: EmptyStateProps) => (
  <div className="empty-state">
    <i className={icon} aria-hidden="true"></i>
    <h3>{title}</h3>
    <p>{message}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary-cart">{actionLabel}</Link>
    )}
  </div>
);

export default EmptyState;
