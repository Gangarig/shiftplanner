'use client'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await resetPassword(email)
      setMsg('Passwort-Reset E-Mail wurde gesendet.')
    } catch (err) {
      setMsg('Fehler beim Senden der E-Mail.')
    }
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "20px"
    }}>
    <div className="card"
        style={{ width: "100%", maxWidth: "360px" }}
    >
      <h2>Passwort vergessen</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <button className="btn" type="submit">Reset anfordern</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
    </div>
  )
}
