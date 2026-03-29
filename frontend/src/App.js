import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import SurgeonPanel from './components/SurgeonPanel';
import PatientPanel from './components/PatientPanel';
import AnatomyPanel from './components/AnatomyPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { generateClarityMD } from './utils/api';

const INITIAL_PROFILE = {
  age: '', sex: '', joint: '', diagnosis: '', activity: '', prior_treatments: '',
};

const LOADING_MESSAGES = [
  'Searching Arthrex procedure catalog...',
  'Ranking procedures by relevance...',
  'Generating clinical summaries...',
];

function App() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [results, setResults] = useState(null);
  const [surgeonSummary, setSurgeonSummary] = useState(null);
  const [patientSummary, setPatientSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
    setError(null);
  };

  const handleStartOver = () => {
    setProfile(INITIAL_PROFILE);
    setResults(null);
    setSurgeonSummary(null);
    setPatientSummary(null);
    setLoading(false);
    setError(null);
  };

  const handleSubmit = async (submittedProfile) => {
    const activeProfile = submittedProfile || profile;

    try {
      setError(null);
      setProfile(activeProfile);
      setLoading(true);

      let msgIdx = 0;
      setLoadingMessage(LOADING_MESSAGES[msgIdx]);

      const msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[msgIdx]);
      }, 2000);

      try {
        const result = await generateClarityMD(activeProfile);
        clearInterval(msgInterval);

        if (result.error || !Array.isArray(result.procedures)) {
          setError(result.error || 'No recommendation payload was returned.');
          setLoading(false);
          return;
        }

        if (result.procedures.length === 0) {
          setError(
            'No matching Arthrex procedures found for this profile. ' +
            'Try refining the diagnosis or affected area.'
          );
          setLoading(false);
          return;
        }

        setResults(result.procedures);
        setSurgeonSummary(result.surgeonSummary);
        setPatientSummary(result.patientSummary);
      } catch (apiErr) {
        clearInterval(msgInterval);
        throw apiErr;
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setResults(null);
      setSurgeonSummary(null);
      setPatientSummary(null);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="app-root">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">Clarity<span>MD</span></div>
          <div className="header-divider" />
          <div className="header-tagline">Orthopedic Procedure Advisor</div>
        </div>
        <div className="header-right">
          <div className="header-pill">Arthrex &times; Groq AI</div>
          {results && (
            <button className="header-new-btn" onClick={handleStartOver}>
              New Patient
            </button>
          )}
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="app-main">
        {error && (
          <div className="alert-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        )}

        <div className={`workspace-grid${results ? '' : ' no-results'}`}>
          {/* Left: Patient Form */}
          <PatientForm
            profile={profile}
            onProfileChange={handleProfileChange}
            onSubmit={handleSubmit}
            isLoading={loading}
            onStartOver={results ? handleStartOver : null}
          />

          {/* Right: Results or placeholder */}
          {results ? (
            <>
              <SurgeonPanel procedures={results} summary={surgeonSummary} />
              <PatientPanel procedures={results} summary={patientSummary} />
              <AnatomyPanel procedures={results} />
            </>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4m0 4h.01"/></svg>
                </div>
                <div className="empty-title">Ready for Analysis</div>
                <div className="empty-desc">
                  Complete the patient intake form and click <strong>Analyze</strong> to
                  receive AI-ranked Arthrex procedure recommendations.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {loading && <LoadingSpinner message={loadingMessage} />}
    </div>
  );
}

export default App;
