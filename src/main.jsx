import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './index.css'

// Error Boundary for graceful crash handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('MODUS Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0f1e, #1a1040)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#e2e8f0',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '480px',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '3rem 2rem',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.75rem'
            }}>
              ⚡
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              MODUS encountered an unexpected error. Your data is safe — try refreshing the page.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('modus_active_tab');
                  window.location.reload();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#94a3b8',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Reset & Refresh
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{ color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Technical Details
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.7rem',
                  color: '#ef4444',
                  overflow: 'auto',
                  maxHeight: '150px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack?.substring(0, 500)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
