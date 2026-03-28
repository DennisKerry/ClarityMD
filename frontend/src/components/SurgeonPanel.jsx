import React from 'react';

export default function SurgeonPanel({ procedures, summary }) {
  const handleCopyBrief = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      alert('Clinical brief copied to clipboard');
    }
  };

  const styles = {
    container: {
      flex: 1,
      padding: '24px',
      backgroundColor: '#F4F6F9',
      borderRadius: '10px',
      border: '1px solid #E0E6ED',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '24px',
      color: '#003087',
    },
    summaryBox: {
      backgroundColor: 'white',
      border: '1px solid #E0E6ED',
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '24px',
      lineHeight: '1.6',
      fontSize: '14px',
      color: '#2C3E50',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    copyButton: {
      padding: '8px 16px',
      marginBottom: '20px',
      backgroundColor: '#0066CC',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
    },
    procedureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
    },
    procedureCard: {
      backgroundColor: 'white',
      border: '1px solid #E0E6ED',
      borderRadius: '10px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    procedureName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#003087',
      marginBottom: '8px',
    },
    procedureInfo: {
      fontSize: '13px',
      color: '#5A6B7A',
      marginBottom: '4px',
    },
    confidenceBar: {
      marginTop: '12px',
      marginBottom: '12px',
    },
    barLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#2C3E50',
      marginBottom: '4px',
    },
    barContainer: {
      width: '100%',
      height: '8px',
      backgroundColor: '#E0E6ED',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: '#003087',
      transition: 'width 0.3s ease-in-out',
    },
    flagsContainer: {
      marginTop: '12px',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      marginRight: '6px',
      marginBottom: '6px',
      backgroundColor: '#FFF3CD',
      color: '#856404',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    noResults: {
      textAlign: 'center',
      color: '#5A6B7A',
      padding: '40px 20px',
      fontSize: '14px',
    },
    responsiveGrid: {
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
      },
    },
  };

  if (!procedures || procedures.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Surgeon View</h2>
        <div style={styles.noResults}>Submit patient profile to see recommendations</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Surgeon View</h2>
      
      {summary && (
        <div>
          <button style={styles.copyButton} onClick={handleCopyBrief}>
            📋 Copy Clinical Brief
          </button>
          <div style={styles.summaryBox}>{summary}</div>
        </div>
      )}

      <div style={styles.procedureGrid}>
        {procedures.map((proc) => (
          <div key={proc.id} style={styles.procedureCard}>
            <div style={styles.procedureName}>{proc.procedure}</div>
            <div style={styles.procedureInfo}>
              <strong>Joint:</strong> {proc.joint}
            </div>
            <div style={styles.procedureInfo}>
              <strong>Product:</strong> {proc.product}
            </div>
            <div style={styles.procedureInfo}>
              <strong>Recovery:</strong> {proc.recovery_weeks} weeks
            </div>

            <div style={styles.confidenceBar}>
              <div style={styles.barLabel}>
                Confidence: {Math.round(proc.score * 100)}%
              </div>
              <div style={styles.barContainer}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${proc.score * 100}%`,
                  }}
                />
              </div>
            </div>

            {proc.contraindication_flags && proc.contraindication_flags.length > 0 && (
              <div style={styles.flagsContainer}>
                {proc.contraindication_flags.map((flag, idx) => (
                  <div key={idx} style={styles.badge}>
                    {flag}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
