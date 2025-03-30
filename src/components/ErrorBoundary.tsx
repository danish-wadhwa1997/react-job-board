import React, { Component } from "react";

export class ErrorBoundary extends Component<any> {
  state = {
    hasError: false,
  };

  static getDerivedStatFromError(error: Error, errorInfo: React.ErrorInfo) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error boundary", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h3>Sorry there was a problem loading this page</h3>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

export default ErrorBoundary;
