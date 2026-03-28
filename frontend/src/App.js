import React, { useState } from 'react'

function App(){
  const [profile, setProfile] = useState({age:'', sex:'', joint:'', diagnosis:'', activity_level:'', prior_treatments:''})
  const [results, setResults] = useState(null)

  function handleChange(e){
    const {name, value} = e.target
    setProfile(p => ({...p, [name]: value}))
  }

  async function handleSubmit(e){
    e.preventDefault()
    const res = await fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(profile)
    })
    const data = await res.json()
    setResults(data)
  }

  return (
    <div style={{display:'flex', gap:20, padding:20}}>
      <div style={{flex:1}}>
        <h2>Patient Profile</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Age</label>
            <input name="age" value={profile.age} onChange={handleChange} />
          </div>
          <div>
            <label>Sex</label>
            <input name="sex" value={profile.sex} onChange={handleChange} />
          </div>
          <div>
            <label>Joint/Area</label>
            <input name="joint" value={profile.joint} onChange={handleChange} />
          </div>
          <div>
            <label>Diagnosis / Symptoms</label>
            <textarea name="diagnosis" value={profile.diagnosis} onChange={handleChange} />
          </div>
          <div>
            <label>Activity Level</label>
            <input name="activity_level" value={profile.activity_level} onChange={handleChange} />
          </div>
          <div>
            <label>Prior Treatments</label>
            <input name="prior_treatments" value={profile.prior_treatments} onChange={handleChange} />
          </div>
          <button type="submit">Recommend</button>
        </form>
      </div>
      <div style={{flex:1}}>
        <h2>Recommendations</h2>
        {results ? (
          <div>
            <h3>Surgeon View</h3>
            {results.surgeon_recommendations.map((r, i)=> (
              <div key={i} style={{border:'1px solid #ddd', padding:8, marginBottom:8}}>
                <strong>{r.procedure} ({r.joint})</strong>
                <div>Product: {r.arthrex_product}</div>
                <div>Technique: {r.technique_notes}</div>
                <div>Confidence: {r.confidence}%</div>
              </div>
            ))}

            <h3>Patient View</h3>
            {results.patient_summaries.map((p, i)=> (
              <div key={i} style={{border:'1px dashed #ccc', padding:8, marginBottom:8}}>
                <strong>{p.procedure}</strong>
                <p>{p.summary}</p>
                <div>Confidence: {p.confidence}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div>No results yet.</div>
        )}
      </div>
    </div>
  )
}

export default App
