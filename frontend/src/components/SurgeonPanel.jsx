import React from 'react';

export default function SurgeonPanel({ procedures, summary }) {
  const handleCopyBrief = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      alert('Clinical brief copied to clipboard');
    }
  };

  const getConfidenceColor = (label) => {
    if (label === 'Strong Match') return { bg: '#D4EDDA', text: '#155724' };
    if (label === 'Good Match') return { bg: '#D1ECF1', text: '#0C5460' };
    if (label === 'Possible Match') return { bg: '#FFF3CD', text: '#856404' };
    return { bg: '#E2E3E5', text: '#383D41' };
  };

  const styles = {
    container: {
      gridColumn: '1 / -1',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '1px solid #E0E6ED',
    },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#003087',
      marginBottom: '8px',
    },
    countLine: {
      fontSize: '14px',
      color: '#5A6B7A',
      fontStyle: 'italic',
    },
    proceduresList: {
      marginBottom: '32px',
    },
    rankCard: {
      display: 'grid',
      gridTemplateColumns: '60px 1fr',
      gap: '16px',
      padding: '20px',
      marginBottom: '16px',
      backgroundColor: '#F9FAFB',
      border: '1px solid #E0E6ED',
      borderRadius: '10px',
    },
    rankBadge: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#003087',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    procedureDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    procedureName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#003087',
      gridColumn: '1 / -1',
      marginBottom: '8px',
    },
    productName: {
      fontSize: '14px',
      color: '#5A6B7A',
      gridColumn: '1 / -1',
      marginBottom: '12px',
      fontStyle: 'italic',
    },
    confidentceSection: {
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    confidenceBadge: {
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
    },
    progressBarContainer: {
      flex: 1,
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#E0E6ED',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#0066CC',
      transition: 'width 0.3s ease-in-out',
    },
    scoreLabel: {
      fontSize: '11px',
      color: '#5A6B7A',
      whiteSpace: 'nowrap',
      padding: '0 4px',
    },
    matchReasons: {
      gridColumn: '1 / -1',
      marginBottom: '12px',
    },
    matchReasonsLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#2C3E50',
      marginBottom: '6px',
    },
    matchReasonsList: {
      listStyleType: 'disc',
      paddingLeft: '20px',
    },
    matchReason: {
      fontSize: '12px',
      color: '#5A6B7A',
      margin: '4px 0',
    },
    techniqueNotes: {
      gridColumn: '1 / -1',
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#5A6B7A',
      marginBottom: '12px',
      padding: '8px',
      backgroundColor: '#F4F6F9',
      borderRadius: '4px',
    },
    recoveryPill: {
      display: 'inline-block',
      padding: '6px 12px',
      backgroundColor: '#E8F4F8',
      color: '#003087',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      marginRight: '12px',
    },
    contraIndicationsRow: {
      gridColumn: '1 / -1',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '12px',
    },
    contraindication: {
      padding: '6px 10px',
      backgroundColor: '#F8D7DA',
      color: '#721C24',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '500',
    },
    arthrexLink: {
      display: 'block',
      fontSize: '12px',
      color: '#0066CC',
      textDecoration: 'none',
      marginTop: '12px',
      transition: 'text-decoration 0.2s',
    },
    divider: {
      borderTop: '2px solid #E0E6ED',
      margin: '32px 0',
    },
    clinicalBriefSection: {
      marginTop: '24px',
    },
    clinicalBriefHeader: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#003087',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    copyButton: {
      padding: '8px 14px',
      backgroundColor: '#0066CC',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    },
    copyButtonHover: {
      backgroundColor: '#0052A3',
    },
    summaryBox: {
      backgroundColor: '#F9FAFB',
      border: '1px solid #E0E6ED',
      borderRadius: '10px',
      padding: '16px',
      lineHeight: '1.6',
      fontSize: '14px',
      color: '#2C3E50',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    noResults: {
      textAlign: 'center',
      color: '#5A6B7A',
      padding: '40px 20px',
      fontSize: '14px',
    },
  };

  if (!procedures || procedures.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Surgical Recommendations</h2>
        <div style={styles.noResults}>Submit patient profile to see recommendations</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Surgical Recommendations</h2>
        <div style={styles.countLine}>
          {procedures.length} procedure{procedures.length !== 1 ? 's' : ''} found, ranked by relevance
        </div>
      </div>

      <div style={styles.proceduresList}>
        {procedures.map((proc, idx) => {
          const confColor = getConfidenceColor(proc.confidence_label);
          const scorePercent = (proc.relevance_score || 0) * 100;

          return (
            <div key={idx} style={styles.rankCard}>
              <div style={styles.rankBadge}>#{idx + 1}</div>
              <div style={styles.procedureDetails}>
                <div style={styles.procedureName}>{proc.procedure}</div>
                <div style={styles.productName}>{proc.product}</div>

                <div style={styles.confidentceSection}>
                  <div
                    style={{
                      ...styles.confidenceBadge,
                      backgroundColor: confColor.bg,
                      color: confColor.text,
                    }}
                  >
                    {proc.confidence_label}
                  </div>
                  <div style={styles.progressBarContainer}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${scorePercent}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div style={styles.scoreLabel}>{scorePercent.toFixed(0)}%</div>
                </div>

                {proc.match_reasons && proc.match_reasons.length > 0 && (
                  <div style={styles.matchReasons}>
                    <div style={styles.matchReasonsLabel}>Why this procedure:</div>
                    <ul style={styles.matchReasonsList}>
                      {proc.match_reasons.map((reason, ridx) => (
                        <li key={ridx} style={styles.matchReason}>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {proc.technique_notes && (
                  <div style={styles.techniqueNotes}>
                    "{proc.technique_notes}"
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={styles.recoveryPill}>
                    ~{proc.recovery_weeks || '12-16'} weeks recovery
                  </span>

                  {proc.contraindications && proc.contraindications.length > 0 && (
                    <div style={styles.contraIndicationsRow}>
                      {proc.contraindications.map((contra, cidx) => (
                        <div key={cidx} style={styles.contraindication}>
                          ⚠️ {contra}
                        </div>
                      ))}
                    </div>
                  )}

                  {proc.arthrex_url && (
                    <a
                      href={proc.arthrex_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.arthrexLink}
                      onMouseEnter={(e) => {
                        e.target.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.textDecoration = 'none';
                      }}
                    >
                      View on Arthrex.com ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {summary && (
        <>
          <div style={styles.divider} />
          <div style={styles.clinicalBriefSection}>
            <div style={styles.clinicalBriefHeader}>
              <span>Clinical Brief</span>
              <button
                style={styles.copyButton}
                onClick={handleCopyBrief}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0052A3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0066CC';
                }}
              >
                📋 Copy Brief
              </button>
            </div>
            <div style={styles.summaryBox}>{summary}</div>
          </div>
        </>
      )}
    </div>
  );
}
