import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-card-hover text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Application State Notice</h2>
              <p className="text-xs text-slate-500 mt-1">
                A component experienced an unexpected state transition. You can refresh to restore the default workspace.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-[11px] text-slate-600 break-all max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
