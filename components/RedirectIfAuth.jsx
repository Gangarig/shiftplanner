'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && user) {
      // User is logged in, redirect to homepage
      router.replace('/')
    }
  }, [mounted, loading, user, router])

  if (!mounted) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #374151",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "#9ca3af" }}>Lade Anwendung...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #374151",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "#9ca3af" }}>Überprüfe Authentifizierung...</p>
      </div>
    )
  }

  if (user) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #374151",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "#9ca3af" }}>Weiterleitung zur Startseite...</p>
      </div>
    )
  }

  return children
}
