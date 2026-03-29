import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import SurgeonPanel from './components/SurgeonPanel';
import PatientPanel from './components/PatientPanel';
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
        <div className="header-brand">
          <div className="header-logo">Clarity<span>MD</span></div>
          <div className="header-divider" />
          <div className="header-tagline">Orthopedic Procedure Recommendation Engine</div>
        </div>
        <div className="header-badge">Arthrex × Groq AI</div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="app-main">
        {error && (
          <div className="alert-error">
            <span>⚠</span>
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
            </>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🦴</div>
                <div className="empty-title">Ready for Analysis</div>
                <div className="empty-desc">
                  Fill in the patient profile and click{' '}
                  <strong>Analyze Patient</strong> to see AI-ranked Arthrex
                  procedure recommendations.
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
