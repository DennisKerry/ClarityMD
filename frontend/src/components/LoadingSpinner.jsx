import React from 'react';

export default function LoadingSpinner({ message }) {
  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="spinner" />
        <div>
          <div className="loading-title">Analyzing Profile</div>
          <div className="loading-msg">{message || 'Please wait...'}</div>
        </div>
      </div>
    </div>
  );
}
