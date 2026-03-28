import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

function getConfidenceClass(score) {
  if (score >= 55) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

function SurgeonView({ recommendations, surgeonSummary }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = recommendations[selectedIdx] || {}

  return (
    <div className="card surgeon-panel">
      <div className="card-title">🔬 Surgeon Clinical Brief</div>

      {/* Ranked Recommendation List */}
      <div className="section-label">Ranked Procedure Matches</div>
      <div className="rec-list">
        {recommendations.map((rec, i) => {
          const confClass = getConfidenceClass(rec.confidence_score)
          return (
            <div
              key={i}
              className={`rec-card${selectedIdx === i ? ' selected' : ''}`}
              onClick={() => setSelectedIdx(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedIdx(i)}
              aria-label={`Select ${rec.procedure}`}
            >
              <div className="rec-card-header">
                <div className={`rec-rank rank-${i + 1}`}>{i + 1}</div>
                <div className="rec-name">{rec.procedure}</div>
                <div className={`confidence-badge ${confClass}`}>
                  {confClass === 'high' ? '✓' : confClass === 'medium' ? '~' : '!'}{' '}
                  {rec.confidence_score}% match
                </div>
              </div>
              <div className="confidence-bar-wrap">
                <div
                  className="confidence-bar"
                  style={{ width: `${rec.confidence_score}%` }}
                />
              </div>
              <div className="rec-product-tag">
                Arthrex Product: <strong>{rec.arthrex_product}</strong>
              </div>
            </div>
          )
        })}
      </div>

      <hr className="divider" />

      {/* Selected Procedure Details */}
      <div className="section-label">Selected: {selected.procedure}</div>
      <div className="detail-grid">
        <div className="detail-item">
          <div className="di-label">Joint / Area</div>
          <div className="di-value">{selected.joint}</div>
        </div>
        <div className="detail-item">
          <div className="di-label">Arthrex Product</div>
          <div className="di-value">{selected.arthrex_product}</div>
        </div>
        <div className="detail-item">
          <div className="di-label">Recommended Age Range</div>
          <div className="di-value">{selected.recommended_age_range} yrs</div>
        </div>
        <div className="detail-item">
          <div className="di-label">Activity Level Fit</div>
          <div className="di-value">{selected.recommended_activity_level}</div>
        </div>
      </div>

      <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
        <div className="di-label">Technique Notes</div>
        <div className="di-value" style={{ fontWeight: 400, fontSize: '0.9rem' }}>
          {selected.technique_notes}
        </div>
      </div>

      <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
        <div className="di-label">Implant Sizing Guidance</div>
        <div className="di-value" style={{ fontWeight: 400, fontSize: '0.9rem' }}>
          {selected.implant_sizing}
        </div>
      </div>

      {selected.contraindications && (
        <div className="contraindications-box">
          <div className="warn-label">⚠️ Risk Flags / Contraindications</div>
          <p>{selected.contraindications}</p>
        </div>
      )}

      <hr className="divider" />

      {/* AI-Generated Surgeon Summary */}
      <div className="section-label">AI-Generated Clinical Summary</div>
      <div className="summary-text">
        <ReactMarkdown>{surgeonSummary}</ReactMarkdown>
      </div>
    </div>
  )
}

export default SurgeonView
