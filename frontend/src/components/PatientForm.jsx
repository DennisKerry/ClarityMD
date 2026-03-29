import React, { useEffect, useState } from 'react';
import BodySelector from './BodySelector';

const ACTIVITY_OPTIONS = ['High', 'Medium', 'Low', 'Sedentary'];

const DEMO_PATIENT = {
  age: '34',
  sex: 'Male',
  joint: 'Knee',
  diagnosis:
    'ACL tear with significant instability following sports injury, failed conservative management',
  activity: 'High',
  prior_treatments:
    'Physical therapy for 3 months, no meaningful improvement, MRI confirmed complete ACL rupture',
};

export default function PatientForm({ profile, onProfileChange, onSubmit, isLoading, onStartOver }) {
  const [formData, setFormData] = useState(profile);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    setFormData(profile);
    setSelectedRegion(profile.joint || '');
    setFieldErrors({});
    setAttemptedSubmit(false);
  }, [profile]);

  const REQUIRED = ['age', 'sex', 'joint', 'diagnosis', 'activity', 'prior_treatments'];

  const validate = (data) => {
    const errors = {};
    REQUIRED.forEach((f) => {
      if (!String(data[f] || '').trim()) {
        errors[f] = f === 'joint' ? 'Select or type a body region' : 'Required';
      }
    });
    return errors;
  };

  const update = (key, value) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    if (key === 'joint') setSelectedRegion(value);
    onProfileChange(next);
    if (attemptedSubmit) setFieldErrors(validate(next));
  };

  const handleChange = (e) => update(e.target.name, e.target.value);

  const handleDemo = () => {
    setFormData(DEMO_PATIENT);
    setSelectedRegion('Knee');
    onProfileChange(DEMO_PATIENT);
    setFieldErrors({});
    setAttemptedSubmit(false);
    window.setTimeout(() => onSubmit(DEMO_PATIENT), 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) onSubmit(formData);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">📋</div>
          Patient Intake
        </div>
        {onStartOver && (
          <button className="btn btn-ghost btn-sm no-print" type="button" onClick={onStartOver}>
            ↻ New Patient
          </button>
        )}
      </div>

      <div className="card-body">
        <form className="form-stack" onSubmit={handleSubmit} noValidate>

          {/* ── Affected Area ── */}
          <div className="form-field">
            <label className="form-label">Affected Area</label>
            <BodySelector
              selectedRegion={selectedRegion}
              onRegionSelect={(joint, region) => {
                const next = { ...formData, joint };
                setFormData(next);
                setSelectedRegion(region || joint || '');
                onProfileChange(next);
                if (attemptedSubmit) setFieldErrors(validate(next));
              }}
            />
            {selectedRegion && (
              <div className="region-badge" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                ✓ {selectedRegion}
              </div>
            )}
            <input
              className={`form-input${fieldErrors.joint ? ' has-error' : ''}`}
              type="text"
              name="joint"
              value={formData.joint}
              onChange={handleChange}
              placeholder="Or type manually (e.g., Knee, Shoulder, Spine)"
            />
            {fieldErrors.joint && (
              <div className="form-error">⚠ {fieldErrors.joint}</div>
            )}
          </div>

          {/* ── Age + Sex ── */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Age</label>
              <input
                className={`form-input${fieldErrors.age ? ' has-error' : ''}`}
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 34"
                min="1"
                max="120"
              />
              {fieldErrors.age && <div className="form-error">⚠ {fieldErrors.age}</div>}
            </div>
            <div className="form-field">
              <label className="form-label">Sex</label>
              <input
                className={`form-input${fieldErrors.sex ? ' has-error' : ''}`}
                type="text"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                placeholder="Male / Female"
              />
              {fieldErrors.sex && <div className="form-error">⚠ {fieldErrors.sex}</div>}
            </div>
          </div>

          {/* ── Diagnosis ── */}
          <div className="form-field">
            <label className="form-label">Diagnosis / Symptoms</label>
            <textarea
              className={`form-textarea${fieldErrors.diagnosis ? ' has-error' : ''}`}
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Chief complaint, severity, relevant history..."
              rows={3}
            />
            {fieldErrors.diagnosis && (
              <div className="form-error">⚠ {fieldErrors.diagnosis}</div>
            )}
          </div>

          {/* ── Activity Level (pill toggle) ── */}
          <div className="form-field">
            <label className="form-label">Activity Level</label>
            <div className="pill-group">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`pill-opt${formData.activity === opt ? ' active' : ''}`}
                  onClick={() => update('activity', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            {fieldErrors.activity && (
              <div className="form-error" style={{ marginTop: '4px' }}>
                ⚠ {fieldErrors.activity}
              </div>
            )}
          </div>

          {/* ── Prior Treatments ── */}
          <div className="form-field">
            <label className="form-label">Prior Treatments</label>
            <textarea
              className={`form-textarea${fieldErrors.prior_treatments ? ' has-error' : ''}`}
              name="prior_treatments"
              value={formData.prior_treatments}
              onChange={handleChange}
              placeholder="Previous treatments, imaging results, failed interventions..."
              rows={3}
            />
            {fieldErrors.prior_treatments && (
              <div className="form-error">⚠ {fieldErrors.prior_treatments}</div>
            )}
          </div>

          {/* ── Action Buttons ── */}
          <div className="btn-row" style={{ marginTop: '4px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : '⚡ Analyze Patient'}
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={handleDemo}
              disabled={isLoading}
            >
              Demo
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}








