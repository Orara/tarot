import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './LanguageContext.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{color:'red', background:'#111', padding:'2rem', fontFamily:'monospace', whiteSpace:'pre-wrap'}}>
          <h2>앱 오류 발생</h2>
          <p>{this.state.error.message}</p>
          <p>{this.state.error.stack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
