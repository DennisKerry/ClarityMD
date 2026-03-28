import { useState } from 'react'

const JOINTS = [
  'Knee',
  'Shoulder',
  'Hip',
  'Ankle',
  'Elbow',
  'Wrist',
  'Other',
]

const ACTIVITY_LEVELS = ['Low', 'Moderate', 'High']

const SEX_OPTIONS = ['Male', 'Female', 'Other / Prefer not to say']

const INITIAL_FORM = {
  age: '',
  sex: '',
  joint: '',
  diagnosis: '',
  symptoms: '',
  activity_level: '',
  prior_treatments: '',
}

function ProfileForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validate() {
    const newErrors = {}
    if (!form.age) newErrors.age = 'Age is required.'
    else if (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)
      newErrors.age = 'Enter a valid age (1–120).'
    if (!form.sex) newErrors.sex = 'Please select a sex.'
    if (!form.joint) newErrors.joint = 'Please select an affected joint.'
    if (!form.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required.'
    if (!form.activity_level) newErrors.activity_level = 'Activity level is required.'
    return newErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    onSubmit(form)
  }

  return (
    <div className="form-page">
      <div className="page-intro">
        <h2>Patient Profile Input</h2>
        <p>Enter the patient's details to receive ML-powered procedure recommendations and AI-generated clinical summaries.</p>
      </div>

      <div className="card">
        <div className="card-title">🩺 Patient Profile</div>
        <form className="profile-form" onSubmit={handleSubmit} noValidate>

          {/* Row: Age + Sex */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age <span className="required">*</span></label>
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                placeholder="e.g. 28"
                value={form.age}
                onChange={handleChange}
                className={errors.age ? 'error' : ''}
                disabled={loading}
              />
              {errors.age && <span className="error-msg">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sex">Biological Sex <span className="required">*</span></label>
              <select
                id="sex"
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className={errors.sex ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select…</option>
                {SEX_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.sex && <span className="error-msg">{errors.sex}</span>}
            </div>
          </div>

          {/* Row: Joint + Activity Level */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="joint">Affected Joint / Area <span className="required">*</span></label>
              <select
                id="joint"
                name="joint"
                value={form.joint}
                onChange={handleChange}
                className={errors.joint ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select…</option>
                {JOINTS.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              {errors.joint && <span className="error-msg">{errors.joint}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="activity_level">Activity Level <span className="required">*</span></label>
              <select
                id="activity_level"
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                className={errors.activity_level ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select…</option>
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {errors.activity_level && <span className="error-msg">{errors.activity_level}</span>}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="form-group">
            <label htmlFor="diagnosis">Primary Diagnosis <span className="required">*</span></label>
            <input
              id="diagnosis"
              name="diagnosis"
              type="text"
              placeholder="e.g. ACL tear, rotator cuff tear, meniscus injury…"
              value={form.diagnosis}
              onChange={handleChange}
              className={errors.diagnosis ? 'error' : ''}
              disabled={loading}
            />
            {errors.diagnosis && <span className="error-msg">{errors.diagnosis}</span>}
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label htmlFor="symptoms">Symptoms / Presentation</label>
            <textarea
              id="symptoms"
              name="symptoms"
              placeholder="e.g. instability, pain with weight bearing, limited range of motion…"
              value={form.symptoms}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Prior Treatments */}
          <div className="form-group">
            <label htmlFor="prior_treatments">Prior Treatments</label>
            <textarea
              id="prior_treatments"
              name="prior_treatments"
              placeholder="e.g. Physical therapy x 3 months, cortisone injection, bracing…"
              value={form.prior_treatments}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Analyzing…
              </>
            ) : (
              <>🔍 Get Procedure Recommendations</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileForm
