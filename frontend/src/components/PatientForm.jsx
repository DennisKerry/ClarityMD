import React from 'react';

export default function PatientForm({ profile, onProfileChange, onSubmit, isLoading }) {
  const demoPatient = {
    age: '34',
    sex: 'Male',
    joint: 'Knee',
    diagnosis: 'ACL tear with instability following sports injury, failed conservative management',
    activity: 'High',
    prior_treatments: 'Physical therapy 3 months, MRI confirmed complete ACL rupture',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onProfileChange({ ...profile, [name]: value });
  };

  const handleLoadDemo = () => {
    onProfileChange(demoPatient);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
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
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    submitBtn: {
      backgroundColor: '#003087',
      color: 'white',
    },
    submitBtnHover: {
      backgroundColor: '#001f52',
    },
    submitBtnDisabled: {
      backgroundColor: '#B0B8C8',
      cursor: 'not-allowed',
    },
    demoBtn: {
      backgroundColor: '#0066CC',
      color: 'white',
    },
    demoBtnHover: {
      backgroundColor: '#004BA0',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Patient Intake</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Age</label>
          <input
            style={styles.input}
            type="number"
            name="age"
            value={profile.age}
            onChange={handleInputChange}
            placeholder="e.g., 34"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sex</label>
          <input
            style={styles.input}
            type="text"
            name="sex"
            value={profile.sex}
            onChange={handleInputChange}
            placeholder="e.g., Male"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Joint / Area</label>
          <input
            style={styles.input}
            type="text"
            name="joint"
            value={profile.joint}
            onChange={handleInputChange}
            placeholder="e.g., Knee"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Diagnosis / Symptoms</label>
          <textarea
            style={styles.textarea}
            name="diagnosis"
            value={profile.diagnosis}
            onChange={handleInputChange}
            placeholder="Describe the patient's condition..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Activity Level</label>
          <input
            style={styles.input}
            type="text"
            name="activity"
            value={profile.activity}
            onChange={handleInputChange}
            placeholder="e.g., High, Medium, Low"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Prior Treatments</label>
          <textarea
            style={styles.textarea}
            name="prior_treatments"
            value={profile.prior_treatments}
            onChange={handleInputChange}
            placeholder="Any previous treatments or interventions..."
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{
              ...styles.button,
              ...styles.submitBtn,
              ...(isLoading ? styles.submitBtnDisabled : {}),
            }}
            type="submit"
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#001f52';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#003087';
            }}
          >
            {isLoading ? 'Analyzing...' : 'Get Recommendations'}
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.demoBtn,
            }}
            type="button"
            onClick={handleLoadDemo}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#004BA0';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#0066CC';
            }}
          >
            Load Demo Patient
          </button>
        </div>
      </form>
    </div>
  );
}
