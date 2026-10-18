import { Component, type ReactNode, type ErrorInfo } from "react";
import { Logo } from "../Logo";
import { ErrorState } from "../ErrorState";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Render inline within a section instead of full-screen */
  inline?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }

  private handleRetry = () => {
    if (this.props.inline) {
      this.setState({ hasError: false, error: null });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { inline } = this.props;

    if (inline) {
      return (
        <ErrorState
          title="Failed to load"
          message="This section encountered an error."
          onRetry={this.handleRetry}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-base p-8 gap-8">
        <Logo size={40} />
        <ErrorState
          title="Something went wrong"
          message="An unexpected error occurred. Reload the page to continue."
          onRetry={this.handleRetry}
          retryLabel="Reload page"
          className="max-w-md border-0 bg-transparent"
        />
      </div>
    );
  }
}

export { ErrorBoundary };
