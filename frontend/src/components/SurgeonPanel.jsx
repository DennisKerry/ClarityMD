import React, { useState } from 'react';
import Markdown from 'react-markdown';

const RANK_LABELS = ['#1', '#2', '#3'];

function rankClass(idx) {
  if (idx === 0) return 'rank-1';
  if (idx === 1) return 'rank-2';
  if (idx === 2) return 'rank-3';
  return 'rank-n';
}

function confClass(label) {
  if (label === 'Strong Match')  return 'strong';
  if (label === 'Good Match')    return 'good';
  if (label === 'Possible Match') return 'possible';
  return 'weak';
}

function badgeClass(label) {
  if (label === 'Strong Match')  return 'badge badge-strong';
  if (label === 'Good Match')    return 'badge badge-good';
  if (label === 'Possible Match') return 'badge badge-possible';
  return 'badge badge-weak';
}

function ProcedureCard({ proc, idx, isOpen, onToggle }) {
  const score   = Math.round((proc.relevance_score || 0) * 100);
  const flags   = proc.contraindication_flags || [];
  const contras = proc.contraindications || [];
  const rk      = rankClass(idx);

  return (
    <div className={`proc-card ${rk}`}>
      {/* ── Card header (always visible, toggles body) ── */}
      <div className="proc-card-head" onClick={onToggle}>
        <div className={`rank-badge ${rk}`}>
          {idx < 3 ? RANK_LABELS[idx] : `#${idx + 1}`}
        </div>

        <div className="proc-meta">
          <div className="proc-name">{proc.procedure}</div>
          <div className="proc-product">{proc.product}</div>
        </div>

        <div className="proc-head-right">
          <span className={badgeClass(proc.confidence_label)}>{proc.confidence_label}</span>
          <svg className={`chevron${isOpen ? ' open' : ''}`} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      {/* ── Card body (collapsible) ── */}
      {isOpen && (
        <div className="proc-card-body">
          {/* Confidence bar */}
          <div className="conf-row">
            <div className="conf-track">
              <div
                className={`conf-fill ${confClass(proc.confidence_label)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="conf-pct">{score}%</span>
          </div>

          {/* Why this procedure */}
          {proc.match_reasons && proc.match_reasons.length > 0 && (
            <div className="reason-tags">
              {proc.match_reasons.map((r, i) => (
                <span key={i} className="reason-tag">{r}</span>
              ))}
            </div>
          )}

          {/* Technique note */}
          {proc.technique_notes && (
            <div className="technique-note">"{proc.technique_notes}"</div>
          )}

          {/* Recovery + category chips */}
          <div className="info-row">
            <span className="info-chip">{proc.recovery_weeks || '12–16'} wks recovery</span>
            {proc.product_category && (
              <span className="info-chip">{proc.product_category}</span>
            )}
          </div>

          {/* Risk flags & contraindications */}
          {(flags.length > 0 || contras.length > 0) && (
            <div className="contra-section">
              {flags.length > 0 && (
                <>
                  <div className="contra-group-label">Profile Risk Flags</div>
                  <div className="flag-tags">
                    {flags.map((f, i) => (
                      <span key={i} className="flag-tag">{f}</span>
                    ))}
                  </div>
                </>
              )}
              {contras.length > 0 && (
                <>
                  <div className="contra-group-label">Contraindications</div>
                  <div className="contra-tags">
                    {contras.map((c, i) => (
                      <span key={i} className="contra-tag">{c}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Arthrex product link */}
          {proc.arthrex_url && (
            <a
              className="arthrex-link"
              href={proc.arthrex_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Arthrex.com ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function SurgeonPanel({ procedures, summary }) {
  const [openIdx, setOpenIdx]   = useState(0);
  const [copied, setCopied]     = useState(false);

  const toggleCard = (idx) => setOpenIdx(openIdx === idx ? null : idx);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!procedures || procedures.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" width="40" height="40"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
          </div>
          <div className="empty-title">Surgical Recommendations</div>
          <div className="empty-desc">
            Submit a patient profile to see ranked procedure recommendations.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
          </div>
          Surgical Recommendations
        </div>
        <span className="badge badge-blue">{procedures.length} procedures</span>
      </div>

      <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <div className="section-label">Ranked by ML Relevance Score</div>

        <div className="proc-list">
          {procedures.map((proc, idx) => (
            <ProcedureCard
              key={idx}
              proc={proc}
              idx={idx}
              isOpen={openIdx === idx}
              onToggle={() => toggleCard(idx)}
            />
          ))}
        </div>

        {summary && (
          <>
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="section-label" style={{ margin: 0 }}>Clinical Brief</div>
              <button className="btn btn-ghost btn-sm no-print" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy Brief'}
              </button>
            </div>
            <div className="clinical-brief">
              <Markdown>{summary}</Markdown>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

