'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { RedirectIfAuth } from '../../components/RedirectIfAuth'

export default function Login() {
  const { login, loading, error, clearError } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)
    clearError()
    
    if (!email || !password) {
      setLocalError('Bitte füllen Sie alle Felder aus')
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      router.push('/')
    } else {
      setLocalError(result.error || 'Login fehlgeschlagen')
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
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Login</h2>
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
                    placeholder="Passwort"
                    required
                    disabled={loading}
                    style={{ width: "100%" }}
                  />
                </div>
                {displayError && (
                  <div style={{
                    color: "#ef4444",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    padding: "12px",
                    fontSize: "14px"
                  }}>
                    {displayError}
                  </div>
                )}
                <button
                  className="btn btn-lg"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Wird angemeldet...' : 'Login'}
                </button>
              </form>
              <div style={{ 
                marginTop: "20px", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <a href="/register" style={{ color: "#3b82f6", fontSize: "14px" }}>
                  Registrieren
                </a>
                <a href="/forgot-password" style={{ color: "#3b82f6", fontSize: "14px" }}>
                  Passwort vergessen?
                </a>
              </div>
            </div>
          </div>
        </RedirectIfAuth>
      )
}
