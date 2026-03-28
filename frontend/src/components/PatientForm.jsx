import React, { useEffect, useState } from 'react';
import BodySelector from './BodySelector';

export default function PatientForm({ profile, onProfileChange, onSubmit, isLoading }) {
  const demoPatient = {
    age: '34',
    sex: 'Male',
    joint: 'Knee',
    diagnosis: 'ACL tear with significant instability following sports injury, failed conservative management',
    activity: 'High',
    prior_treatments:
      'Physical therapy for 3 months, no meaningful improvement, MRI confirmed complete ACL rupture',
  };

  const [formData, setFormData] = useState(profile);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    setFormData(profile);
    setSelectedRegion(profile.joint ? profile.joint : '');
    setFieldErrors({});
    setAttemptedSubmit(false);
  }, [profile]);

  const requiredFields = ['age', 'sex', 'joint', 'diagnosis', 'activity', 'prior_treatments'];

  const validate = (data) => {
    const errors = {};
    requiredFields.forEach((field) => {
      if (!String(data[field] || '').trim()) {
        errors[field] = field === 'joint' ? 'Please select a body region' : 'This field is required.';
      }
    });
    return errors;
  };

  const isFormComplete = requiredFields.every((field) => String(formData[field] || '').trim());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    onProfileChange(nextData);

    if (attemptedSubmit) {
      setFieldErrors(validate(nextData));
    }
  };

  const handleLoadDemo = () => {
    setFormData(demoPatient);
    setSelectedRegion('Knee (Left)');
    onProfileChange(demoPatient);
    setFieldErrors({});
    setAttemptedSubmit(false);

    window.setTimeout(() => {
      onSubmit(demoPatient);
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    const errors = validate(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit(formData);
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
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#2C3E50',
    },
    jointSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '4px',
    },
    selectedBadge: {
      display: 'inline-block',
      alignSelf: 'flex-start',
      padding: '6px 12px',
      borderRadius: '999px',
      backgroundColor: '#EAF2FF',
      border: '1px solid #003087',
      color: '#003087',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '0.2px',
    },
    helperText: {
      fontSize: '12px',
      color: '#5A6B7A',
      marginTop: '-4px',
    },
    input: {
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #D1D9E6',
      borderRadius: '6px',
      fontFamily: 'inherit',
    },
    textarea: {
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #D1D9E6',
      borderRadius: '6px',
      fontFamily: 'inherit',
      minHeight: '80px',
      resize: 'vertical',
    },
    errorText: {
      color: '#B42318',
      fontSize: '12px',
      marginTop: '2px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '12px',
    },
    button: {
      flex: 1,
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    submitBtn: {
      backgroundColor: '#003087',
      color: 'white',
      border: 'none',
    },
    submitBtnHover: {
      backgroundColor: '#001f52',
    },
    submitBtnDisabled: {
      backgroundColor: '#B0B8C8',
      cursor: 'not-allowed',
    },
    demoBtn: {
      backgroundColor: 'transparent',
      color: '#0066CC',
      border: '2px solid #0066CC',
    },
    demoBtnHover: {
      backgroundColor: '#EAF2FF',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Patient Intake</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.jointSection}>
          <label style={styles.label}>Joint / Area</label>
          <div style={styles.helperText}>
            Click an anatomical region below to select the affected area.
          </div>
          <BodySelector
            selectedRegion={selectedRegion}
            onRegionSelect={(joint, region) => {
              const nextData = { ...formData, joint };
              setFormData(nextData);
              setSelectedRegion(region || '');
              onProfileChange(nextData);
              if (attemptedSubmit) {
                setFieldErrors(validate(nextData));
              }
            }}
          />
          {selectedRegion && (
            <div style={styles.selectedBadge}>Selected area: {selectedRegion}</div>
          )}
          {fieldErrors.joint && <div style={styles.errorText}>{fieldErrors.joint}</div>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Age</label>
          <input
            style={styles.input}
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="e.g., 34"
          />
          {fieldErrors.age && <div style={styles.errorText}>{fieldErrors.age}</div>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sex</label>
          <input
            style={styles.input}
            type="text"
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            placeholder="e.g., Male"
          />
          {fieldErrors.sex && <div style={styles.errorText}>{fieldErrors.sex}</div>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Diagnosis / Symptoms</label>
          <textarea
            style={styles.textarea}
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            placeholder="Describe the patient's condition..."
          />
          {fieldErrors.diagnosis && <div style={styles.errorText}>{fieldErrors.diagnosis}</div>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Activity Level</label>
          <input
            style={styles.input}
            type="text"
            name="activity"
            value={formData.activity}
            onChange={handleInputChange}
            placeholder="e.g., High, Medium, Low"
          />
          {fieldErrors.activity && <div style={styles.errorText}>{fieldErrors.activity}</div>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Prior Treatments</label>
          <textarea
            style={styles.textarea}
            name="prior_treatments"
            value={formData.prior_treatments}
            onChange={handleInputChange}
            placeholder="Any previous treatments or interventions..."
          />
          {fieldErrors.prior_treatments && (
            <div style={styles.errorText}>{fieldErrors.prior_treatments}</div>
          )}
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{
              ...styles.button,
              ...styles.submitBtn,
              ...(isLoading ? styles.submitBtnDisabled : {}),
            }}
            type="submit"
            disabled={isLoading || !isFormComplete}
            onMouseEnter={(e) => {
              if (!isLoading && isFormComplete) e.target.style.backgroundColor = '#001f52';
            }}
            onMouseLeave={(e) => {
              if (!isLoading && isFormComplete) e.target.style.backgroundColor = '#003087';
            }}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Patient'}
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.demoBtn,
            }}
            type="button"
            onClick={handleLoadDemo}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#EAF2FF';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Load Demo Patient
          </button>
        </div>
      </form>
    </div>
  );
}
