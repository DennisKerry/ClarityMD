import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import SurgeonPanel from './components/SurgeonPanel';
import PatientPanel from './components/PatientPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { generateClarityMD } from './utils/claude';
import { scoreAndRankProcedures } from './utils/recommend';
import PROCEDURES_CATALOG from './data/procedures.json';

const INITIAL_PROFILE = {
  age: '',
  sex: '',
  joint: '',
  diagnosis: '',
  activity: '',
  prior_treatments: '',
};

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

      // Cycle through loading messages every 2 seconds
      const messages = [
        'Searching Arthrex procedure catalog...',
        'Ranking procedures by relevance...',
        'Generating clinical summaries...',
      ];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);

      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2000);

      try {
        // Generate both procedures and summaries via Claude
        const result = await generateClarityMD(activeProfile);

        clearInterval(messageInterval);

        if (result.error) {
          setResults(null);
          setSurgeonSummary(null);
          setPatientSummary(null);
          setError(result.error);
          setLoading(false);
          return;
        }

        if (!result.procedures || result.procedures.length === 0) {
          // Claude returned empty — fall back to local scoring engine
          const fallbackMatches = scoreAndRankProcedures(activeProfile, PROCEDURES_CATALOG);
          if (fallbackMatches.length === 0) {
            setResults(null);
            setSurgeonSummary(null);
            setPatientSummary(null);
            setError(
              'No matching Arthrex procedures found for this profile. ' +
              'Try refining the diagnosis or affected area. ' +
              'For cervical/spine complaints without neurological signs, conservative management is typically first-line.'
            );
            setLoading(false);
            return;
          }
          // Shape fallback results to match the Claude response schema
          const shaped = fallbackMatches.map((p, idx) => ({
            rank: idx + 1,
            procedure: p.procedure,
            product: p.product,
            product_url: p.product_url || '',
            product_category: p.product_category,
            relevance_score: p.score,
            match_reasons: ['Matched by diagnosis keywords and joint area'],
            technique_notes: p.technique,
            recovery_weeks: p.recovery_weeks,
            contraindications: p.contraindications || [],
            arthrex_url: p.product_url || 'https://www.arthrex.com',
            confidence_label:
              p.score >= 0.85 ? 'Strong Match' : p.score >= 0.6 ? 'Good Match' : 'Possible Match',
          }));
          setResults(shaped);
          setSurgeonSummary(
            `Fallback recommendation (Claude API unavailable): ${shaped.map((p) => p.procedure).join(', ')} based on joint and diagnosis keywords.`
          );
          setPatientSummary(
            `Your top recommended procedure is ${shaped[0].procedure} using ${shaped[0].product}. Recovery is approximately ${shaped[0].recovery_weeks} weeks. Ask your surgeon for details.`
          );
          setLoading(false);
          return;
        }

        setResults(result.procedures);
        setSurgeonSummary(result.surgeonSummary);
        setPatientSummary(result.patientSummary);
      } catch (apiErr) {
        clearInterval(messageInterval);
        // Claude API failed — use local scoring fallback before giving up
        const fallbackMatches = scoreAndRankProcedures(activeProfile, PROCEDURES_CATALOG);
        if (fallbackMatches.length > 0) {
          const shaped = fallbackMatches.map((p, idx) => ({
            rank: idx + 1,
            procedure: p.procedure,
            product: p.product,
            product_url: p.product_url || '',
            product_category: p.product_category,
            relevance_score: p.score,
            match_reasons: ['Matched by diagnosis keywords and joint area'],
            technique_notes: p.technique,
            recovery_weeks: p.recovery_weeks,
            contraindications: p.contraindications || [],
            arthrex_url: p.product_url || 'https://www.arthrex.com',
            confidence_label:
              p.score >= 0.85 ? 'Strong Match' : p.score >= 0.6 ? 'Good Match' : 'Possible Match',
          }));
          setResults(shaped);
          setSurgeonSummary(
            `⚠️ Claude API was partially unavailable. Fallback summary text is shown.\n\nRecommended: ${shaped.map((p) => p.procedure).join(', ')}.`
          );
          setPatientSummary(
            `Your top recommended procedure is ${shaped[0].procedure} using ${shaped[0].product}. Recovery is approximately ${shaped[0].recovery_weeks} weeks. Speak with your surgeon for a full clinical assessment.`
          );
          setLoading(false);
          return;
        }
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

  const styles = {
    app: {
      minHeight: '100vh',
      backgroundColor: '#F4F6F9',
      padding: '20px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logo: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#003087',
      marginBottom: '8px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#5A6B7A',
      fontWeight: '400',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: results ? '1fr 1fr' : '1fr 1fr',
      gap: '24px',
    },
    dashboard: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    errorBox: {
      backgroundColor: '#FADBD8',
      border: '1px solid #F5B7B1',
      borderRadius: '10px',
      padding: '16px',
      color: '#78281F',
      marginBottom: '16px',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    startOverButton: {
      marginTop: '24px',
      padding: '12px 24px',
      backgroundColor: '#003087',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s',
    },
    startOverButtonHover: {
      backgroundColor: '#001f52',
    },
    fadeIn: {
      animation: 'fadeIn 0.4s ease-in-out',
    },
    keyframes: `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.logo}>ClarityMD</div>
          <div style={styles.subtitle}>Orthopedic Procedure Recommendation Engine</div>
        </div>

        {error && <div style={styles.errorBox}>❌ {error}</div>}

        <div style={styles.container}>
          <div>
            <PatientForm
              profile={profile}
              onProfileChange={handleProfileChange}
              onSubmit={handleSubmit}
              isLoading={loading}
            />
          </div>

          <div>
            {results ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <SurgeonPanel procedures={results} summary={surgeonSummary} />
                <PatientPanel procedures={results} summary={patientSummary} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <button
                    style={styles.startOverButton}
                    onClick={handleStartOver}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#001f52';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#003087';
                    }}
                  >
                    ↻ Start Over
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #E0E6ED',
                  borderRadius: '10px',
                  color: '#5A6B7A',
                  fontSize: '14px',
                }}
              >
                {loading ? loadingMessage || 'Searching Arthrex procedure catalog...' : 'Submit patient profile to see recommendations'}
              </div>
            )}
          </div>
        </div>

        {loading && <LoadingSpinner />}
      </div>
    </>
  );
}

export default App;
