import React, { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  pageSource: 'main_page' | 'widget' | 'shared';
  doggyName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for Doggy pages
 * Catches errors and reports them to the self-healing agent
 * ONLY affects Doggy module, never main site
 */
class DoggyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to self-healing agent
    this.reportError(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const session_id = sessionStorage.getItem('doggy_session_id');
      
      await supabase.functions.invoke('doggy-self-heal', {
        body: {
          action: 'report-error',
          data: {
            error_type: 'render',
            error_message: error.message,
            stack_trace: errorInfo.componentStack,
            page_source: this.props.pageSource,
            doggy_name: this.props.doggyName,
            action_attempted: 'page_render',
            session_id,
            user_agent: navigator.userAgent
          }
        }
      });
    } catch (e) {
      // Silent fail
      console.debug('Error reporting failed:', e);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h2 className="font-mono text-lg font-bold text-foreground">
              Oops! Doggy got confused
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              Something went wrong displaying the doggies. Our self-healing agent has been notified!
            </p>
            <Button 
              onClick={this.handleRetry}
              className="font-mono text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Try Again
            </Button>
            <p className="font-mono text-[10px] text-muted-foreground/50">
              Error: {this.state.error?.message?.substring(0, 50)}...
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DoggyErrorBoundary;
