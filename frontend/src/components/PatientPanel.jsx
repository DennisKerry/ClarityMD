import React, { useState } from 'react';

export default function PatientPanel({ procedures, summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const lines = [
      'ClarityMD \u2014 Patient Summary',
      '',
      summary || '',
      '',
      'Expected Recovery:',
      ...procedures.map((p) => `\u2022 ${p.procedure}: ~${p.recovery_weeks || '12\u201316'} weeks`),
    ];
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.write(
      `<!DOCTYPE html><html><head><title>ClarityMD \u2014 Patient Summary</title>` +
      `<style>body{font-family:Arial,sans-serif;line-height:1.7;padding:28px;color:#1D2939}` +
      `h1{color:#003087;margin-bottom:20px}pre{white-space:pre-wrap;font-size:14px}</style>` +
      `</head><body><h1>ClarityMD \u2014 Patient Summary</h1>` +
      `<pre>${lines.join('\n')}</pre></body></html>`
    );
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 250);
  };

  if (!procedures || procedures.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">Patient Summary</div>
          <div className="empty-desc">
            A plain-language explanation will appear here after analysis.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">📄</div>
          Patient-Friendly Summary
        </div>
        <div className="btn-row no-print">
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
            🖨 Print
          </button>
        </div>
      </div>

      <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        {summary && (
          <>
            <div className="section-label">Plain-Language Explanation</div>
            <div className="patient-summary">{summary}</div>
            <hr className="divider" />
          </>
        )}

        <div className="section-label">Expected Recovery Timeline</div>
        <div className="timeline">
          {procedures.map((proc, idx) => (
            <div key={idx} className={`tl-item${idx === 0 ? ' first-pick' : ''}`}>
              <div className="tl-dot" />
              <div className="tl-name">{proc.procedure}</div>
              <div className="tl-detail">
                ~{proc.recovery_weeks || '12\u201316'} weeks
                {proc.product ? ` \u00b7 ${proc.product}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


