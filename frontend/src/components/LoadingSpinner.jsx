import React from 'react';

export default function LoadingSpinner() {
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '4px solid rgba(0, 48, 135, 0.1)',
      borderTop: '4px solid #003087',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    text: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#003087',
    },
    keyframes: `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.overlay}>
        <div style={styles.container}>
          <div style={styles.spinner}></div>
          <div style={styles.text}>Analyzing patient profile...</div>
        </div>
      </div>
    </>
  );
}
