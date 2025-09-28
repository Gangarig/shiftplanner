'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { RedirectIfAuth } from '../../components/RedirectIfAuth'

export default function Register() {
  const { register, loading, error, clearError } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [localError, setLocalError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)
    clearError()
    
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setLocalError('Bitte füllen Sie alle Felder aus')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwörter stimmen nicht überein')
      return
    }

    if (password.length < 6) {
      setLocalError('Passwort muss mindestens 6 Zeichen lang sein')
      return
    }

    const result = await register(email, password, {
      role: 'worker',
      firstName: firstName,
      lastName: lastName,
      isActive: true
    })
    
    if (result.success) {
      router.push('/')
    } else {
      setLocalError(result.error || 'Registrierung fehlgeschlagen')
    }
  }

  const displayError = localError || error

  return (
    <RedirectIfAuth>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "16px"
      }}>
        <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
          <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Registrieren</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email" 
                required 
                disabled={loading}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Passwort (min. 6 Zeichen)" 
                required 
                disabled={loading}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Passwort bestätigen"
                required
                disabled={loading}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "12px" 
            }}>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Vorname"
                required
                disabled={loading}
              />
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Nachname"
                required
                disabled={loading}
              />
            </div>
            {displayError && (
              <div style={{ 
                color: "#ef4444", 
                backgroundColor: "#fef2f2", 
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "14px"
              }}>
                {displayError}
              </div>
            )}
            <button 
              className="btn" 
              type="submit" 
              disabled={loading}
              style={{ 
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Wird registriert...' : 'Registrieren'}
            </button>
          </form>
          <p style={{ marginTop: "12px", textAlign: "center" }}>
            <a href="/login">Bereits Konto?</a>
          </p>
        </div>
      </div>
    </RedirectIfAuth>
  )
}
