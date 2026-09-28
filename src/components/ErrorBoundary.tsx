import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled error in app tree:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <div className="empty-state">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            <h3>Something went wrong</h3>
            <p>Please refresh the page. If the problem continues, try again later.</p>
            <a href="/" className="btn-primary-cart">Back to Home</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
