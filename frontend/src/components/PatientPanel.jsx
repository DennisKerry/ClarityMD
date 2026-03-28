import React from 'react';

export default function PatientPanel({ procedures, summary }) {
  const handleCopyForPatient = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      alert('Summary copied to clipboard');
    }
  };

  const handlePrint = () => {
    const printContent = `
ClarityMD - Patient Summary

${summary}

Recovery Timeline:
${procedures
  .map((proc) => `- ${proc.procedure}: ${proc.recovery_weeks} weeks`)
  .join('\n')}

Important Considerations:
${procedures.map((proc) => `- ${proc.procedure}: ${proc.contraindications.join(', ')}`).join('\n')}
    `.trim();

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.write(`
<!DOCTYPE html>
<html>
<head>
  <title>ClarityMD - Patient Summary</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
    h1 { color: #003087; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <h1>ClarityMD - Patient Summary</h1>
  <pre>${printContent}</pre>
</body>
</html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 250);
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
      padding: '20px',
      marginBottom: '24px',
      lineHeight: '1.6',
      fontSize: '15px',
      color: '#2C3E50',
      minHeight: '120px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
    },
    button: {
      flex: 1,
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    copyBtn: {
      backgroundColor: '#0066CC',
      color: 'white',
    },
    printBtn: {
      backgroundColor: '#003087',
      color: 'white',
    },
    timelineContainer: {
      backgroundColor: 'white',
      border: '1px solid #E0E6ED',
      borderRadius: '10px',
      padding: '20px',
    },
    timelineTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#003087',
      marginBottom: '16px',
    },
    timelineItem: {
      paddingLeft: '24px',
      marginBottom: '16px',
      position: 'relative',
      fontSize: '14px',
      color: '#2C3E50',
    },
    timelineBullet: {
      position: 'absolute',
      left: '0',
      top: '6px',
      width: '12px',
      height: '12px',
      backgroundColor: '#0066CC',
      borderRadius: '50%',
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
        <h2 style={styles.title}>Patient Friendly Summary</h2>
        <div style={styles.noResults}>Submit patient profile to see summary</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Patient Friendly Summary</h2>

      {summary && (
        <div>
          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.button, ...styles.copyBtn }}
              onClick={handleCopyForPatient}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#004BA0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#0066CC';
              }}
            >
              📋 Copy for Patient
            </button>
            <button
              style={{ ...styles.button, ...styles.printBtn }}
              onClick={handlePrint}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#001f52';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#003087';
              }}
            >
              🖨️ Print Summary
            </button>
          </div>
          <div style={styles.summaryBox}>{summary}</div>
        </div>
      )}

      <div style={styles.timelineContainer}>
        <div style={styles.timelineTitle}>📅 Expected Recovery Timeline</div>
        {procedures.map((proc, idx) => (
          <div key={idx} style={styles.timelineItem}>
            <div style={styles.timelineBullet}></div>
            <div>
              <strong>{proc.procedure}</strong>: {proc.recovery_weeks} weeks
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
