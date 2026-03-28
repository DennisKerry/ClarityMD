import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

function PatientView({ patientSummary, topProcedure }) {
  const [ttsState, setTtsState] = useState('idle') // idle | loading | playing | error
  const [ttsError, setTtsError] = useState('')
  const audioRef = useRef(null)

  async function handlePlayAudio() {
    if (ttsState === 'playing') {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setTtsState('idle')
      return
    }

    setTtsState('loading')
    setTtsError('')

    try {
      const resp = await fetch('/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: patientSummary }),
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'TTS request failed')
      }

      const { audio_base64, content_type } = await resp.json()
      const audioSrc = `data:${content_type};base64,${audio_base64}`

      if (audioRef.current) {
        audioRef.current.src = audioSrc
        audioRef.current.onended = () => setTtsState('idle')
        audioRef.current.play()
        setTtsState('playing')
      }
    } catch (err) {
      setTtsState('error')
      setTtsError(err.message || 'Voice playback unavailable.')
    }
  }

  const ttsAvailable = true // always show button; backend handles key check

  return (
    <div className="card patient-panel">
      <div className="card-title">💬 Patient Education Summary</div>

      {topProcedure && (
        <div
          style={{
            background: 'white',
            border: '1.5px solid #b8e6e0',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🏥</span>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Recommended Procedure
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              {topProcedure.procedure}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Arthrex Product
            </div>
            <div style={{ fontWeight: 600, color: 'var(--accent-teal)', fontSize: '0.9rem' }}>
              {topProcedure.arthrex_product}
            </div>
          </div>
        </div>
      )}

      <div className="patient-summary-text">
        <ReactMarkdown>{patientSummary}</ReactMarkdown>
      </div>

      {/* ElevenLabs TTS Controls */}
      <div className="tts-controls">
        <button
          className="btn-tts"
          onClick={handlePlayAudio}
          disabled={ttsState === 'loading'}
          title={ttsState === 'playing' ? 'Stop audio' : 'Read aloud for patient'}
        >
          {ttsState === 'loading' && (
            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          )}
          {ttsState === 'playing' ? '⏹ Stop Audio' : '🔊 Read Aloud'}
        </button>

        {ttsState === 'playing' && (
          <span className="tts-status">▶ Playing patient summary…</span>
        )}
        {ttsState === 'error' && (
          <span className="tts-status" style={{ color: 'var(--danger-red)' }}>
            {ttsError}
          </span>
        )}
        {ttsState === 'idle' && (
          <span className="tts-status">Play for patient in-office via ElevenLabs</span>
        )}

        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}

export default PatientView
