import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

const NotFound = () => (
  <>
    <Header />
    <div className="page">
      <EmptyState
        icon="fa-solid fa-compass"
        title="Page not found"
        message="The page you're looking for doesn't exist or may have moved."
        actionLabel="Back to Home"
        actionTo="/"
      />
    </div>
  </>
);

export default NotFound;
