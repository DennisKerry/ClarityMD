import { useState } from 'react'
import ProfileForm from './components/ProfileForm'
import SurgeonView from './components/SurgeonView'
import PatientView from './components/PatientView'

function App() {
  const [view, setView] = useState('form') // 'form' | 'dashboard'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  async function handleFormSubmit(profile) {
    setLoading(true)
    setError('')

    try {
      const resp = await fetch('/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || `Server error: ${resp.status}`)
      }

      setResults(data)
      setView('dashboard')
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setView('form')
    setResults(null)
    setError('')
  }

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">+</div>
          Clarity<span className="md-blue">MD</span>
        </div>
        <span className="tagline">AI-Powered Surgical Decision Support · Arthrex</span>
      </header>

      {/* Main */}
      <main className="main-content">
        {error && view === 'form' && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        {view === 'form' && (
          <ProfileForm onSubmit={handleFormSubmit} loading={loading} />
        )}

        {view === 'dashboard' && results && (
          <Dashboard results={results} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}

function ProfileSummaryBar({ profile }) {
  const chips = [
    { label: 'Age', value: profile.age },
    { label: 'Sex', value: profile.sex },
    { label: 'Joint', value: profile.joint },
    { label: 'Diagnosis', value: profile.diagnosis },
    { label: 'Activity', value: profile.activity_level },
  ]

  return (
    <div className="profile-summary">
      {chips.map((c) => (
        <div className="profile-chip" key={c.label}>
          <span className="label">{c.label}</span>
          <span className="value">{c.value}</span>
        </div>
      ))}
    </div>
  )
}

function Dashboard({ results, onBack }) {
  const { recommendations, surgeon_summary, patient_summary, profile } = results

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Procedure Recommendations</h2>
        <button className="btn-back" onClick={onBack}>
          ← New Patient
        </button>
      </div>

      <ProfileSummaryBar profile={profile} />

      <div className="dashboard-grid">
        <SurgeonView
          recommendations={recommendations}
          surgeonSummary={surgeon_summary}
        />
        <PatientView
          patientSummary={patient_summary}
          topProcedure={recommendations[0]}
        />
      </div>
    </div>
  )
}

export default App
