'use client'
import { useAuth } from '../context/AuthContext'
import { RequireAuth } from '../components/RequireAuth'
import { RoleGuard, AdminOnly, ManagerOnly, AccountantOnly, WorkerOnly } from '../components/RoleGuard'
import { ROLE_PERMISSIONS } from '../lib/roles'
import { useMounted } from '../hooks/useMounted'
import { useEffect, useState } from 'react'

export default function Home() {
  const { user, logout, getUserRole, isAdmin, isManager, isAccountant, isWorker } = useAuth()
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const mounted = useMounted()

  useEffect(() => {
    // Check if user was redirected from auth pages
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('redirected') === 'true') {
      setShowWelcomeMessage(true)
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const userRole = getUserRole()
  const roleInfo = ROLE_PERMISSIONS[userRole]

  return (
    <RequireAuth>
      <div className="container">
        <header style={{ 
          marginBottom: "32px",
          paddingBottom: "20px",
          borderBottom: "1px solid #2a3142"
        }}>
          <div style={{ marginBottom: "16px" }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: "1.5rem", 
              color: "#e7ebf3",
              lineHeight: "1.2"
            }}>
              Willkommen im Shift Planner
            </h1>
            <p style={{ 
              margin: "8px 0 0 0", 
              color: "#9ca3af",
              fontSize: "14px"
            }}>
              Schichtplanung und Personalverwaltung
            </p>
            {mounted && (
              <div style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                <span style={{
                  color: roleInfo.color,
                  fontSize: "18px"
                }}>
                  {roleInfo.icon}
                </span>
                <span style={{
                  color: roleInfo.color,
                  fontWeight: "500",
                  fontSize: "14px"
                }}>
                  {roleInfo.name}
                </span>
                <span style={{ 
                  color: "#6b7280", 
                  fontSize: "12px",
                  display: "none" // Hide on mobile
                }} className="hidden-mobile">
                  - {roleInfo.description}
                </span>
              </div>
            )}
            {showWelcomeMessage && (
              <div style={{
                marginTop: "12px",
                padding: "12px 16px",
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#9ca3af",
                fontSize: "14px"
              }}>
                ✅ Sie sind bereits angemeldet. Willkommen zurück!
              </div>
            )}
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            {mounted && (
              <span style={{ 
                color: "#9ca3af",
                fontSize: "14px",
                wordBreak: "break-all"
              }}>
                Angemeldet als: <strong style={{ color: "#e7ebf3" }}>{user?.email || user?.username}</strong>
              </span>
            )}
            <button onClick={logout} className="btn btn-sm">
              Abmelden
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 mb-4" style={{ 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}>
          {/* Schichtplan - Available to Manager and Admin */}
          <RoleGuard requiredRole="manager">
            <div className="card">
              <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>📅 Schichtplan</h3>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
                Verwalten Sie Schichten und weisen Sie Mitarbeiter zu verschiedenen Stationen zu.
              </p>
                  <a href="/schichtplan" className="btn" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}>
                    Schichtplan öffnen
                  </a>
            </div>
          </RoleGuard>

          {/* Worker's own shifts */}
          <WorkerOnly>
            <div className="card">
              <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>📅 Meine Schichten</h3>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
                Zeigen Sie Ihre eigenen Schichten und Arbeitszeiten an.
              </p>
              <button className="btn" style={{ width: "100%" }}>
                Meine Schichten anzeigen
              </button>
            </div>
          </WorkerOnly>

          {/* Mitarbeiter - Available to Admin and Manager */}
          <RoleGuard requiredRole="manager">
            <div className="card">
              <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>👥 Mitarbeiter</h3>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
                Verwalten Sie Mitarbeiter und deren Verfügbarkeit.
              </p>
                  <a href="/mitarbeiter" className="btn" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}>
                    Mitarbeiter verwalten
                  </a>
            </div>
          </RoleGuard>

          {/* Berichte - Available to Accountant, Manager and Admin */}
          <RoleGuard requiredRole="accountant">
            <div className="card">
              <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>📊 Berichte</h3>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
                Analysieren Sie Schichtdaten und erstellen Sie Berichte.
              </p>
              <button className="btn" style={{ width: "100%" }}>
                Berichte anzeigen
              </button>
            </div>
          </RoleGuard>

          {/* Admin only features */}
          <AdminOnly>
            <div className="card">
              <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>⚙️ Systemverwaltung</h3>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
                Verwalten Sie Benutzer, Rollen und Systemeinstellungen.
              </p>
              <button className="btn" style={{ width: "100%" }}>
                System verwalten
              </button>
            </div>
          </AdminOnly>

          <AdminOnly>
            <div className="card">
              <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>👑 Benutzerverwaltung</h3>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
                Erstellen und verwalten Sie Benutzerkonten und Rollen.
              </p>
              <button className="btn" style={{ width: "100%" }}>
                Benutzer verwalten
              </button>
            </div>
          </AdminOnly>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, color: "#e7ebf3" }}>🚀 Schnellstart</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", backgroundColor: "#1f2937", borderRadius: "8px", border: "1px solid #374151" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#e7ebf3" }}>1. Mitarbeiter hinzufügen</h4>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: "14px" }}>
                Fügen Sie neue Mitarbeiter zu Ihrem System hinzu.
              </p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "#1f2937", borderRadius: "8px", border: "1px solid #374151" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#e7ebf3" }}>2. Schichten erstellen</h4>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: "14px" }}>
                Erstellen Sie Schichten für verschiedene Stationen.
              </p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "#1f2937", borderRadius: "8px", border: "1px solid #374151" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#e7ebf3" }}>3. Zuweisungen planen</h4>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: "14px" }}>
                Weisen Sie Mitarbeiter den Schichten zu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
