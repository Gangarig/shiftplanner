'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { RequireAuth } from '../../../components/RequireAuth'
import { AdminOnly } from '../../../components/RoleGuard'
import { ROLE_PERMISSIONS, getAllRoles } from '../../../lib/roles'
import pb from '../../../lib/pb'

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'worker',
    firstName: '',
    lastName: '',
    isActive: true
  })

  const roles = getAllRoles()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('users').getFullList({
        sort: '-created'
      })
      setUsers(records)
    } catch (err) {
      setError('Fehler beim Laden der Benutzer: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await pb.collection('users').create({
        ...newUser,
        passwordConfirm: newUser.password
      })
      setNewUser({
        email: '',
        password: '',
        role: 'worker',
        firstName: '',
        lastName: '',
        isActive: true
      })
      setShowAddForm(false)
      loadUsers()
    } catch (err) {
      setError('Fehler beim Erstellen des Benutzers: ' + err.message)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await pb.collection('users').update(userId, {
        isActive: !currentStatus
      })
      loadUsers()
    } catch (err) {
      setError('Fehler beim Aktualisieren des Benutzers: ' + err.message)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      await pb.collection('users').update(userId, {
        role: newRole
      })
      loadUsers()
    } catch (err) {
      setError('Fehler beim Aktualisieren der Rolle: ' + err.message)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <AdminOnly>
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
            <p style={{ color: "#9ca3af" }}>Lade Benutzer...</p>
          </div>
        </AdminOnly>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <AdminOnly fallback={
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div style={{
            fontSize: "48px",
            color: "#6b7280"
          }}>🔒</div>
          <h3 style={{ color: "#e7ebf3", margin: 0 }}>
            Nur für Administratoren
          </h3>
          <p style={{ color: "#9ca3af", textAlign: "center", maxWidth: "400px" }}>
            Diese Seite ist nur für Administratoren zugänglich.
          </p>
        </div>
      }>
        <div className="container">
          <header style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "1px solid #2a3142"
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "2rem", color: "#e7ebf3" }}>
                👑 Benutzerverwaltung
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#9ca3af" }}>
                Verwalten Sie Benutzerkonten und Rollen
              </p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn"
            >
              {showAddForm ? 'Abbrechen' : '+ Neuer Benutzer'}
            </button>
          </header>

          {error && (
            <div style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#ef4444"
            }}>
              {error}
            </div>
          )}

          {showAddForm && (
            <div className="card" style={{ marginBottom: "30px" }}>
              <h3>Neuen Benutzer erstellen</h3>
              <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="email"
                    placeholder="E-Mail"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Passwort"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="Vorname"
                    value={newUser.firstName}
                    onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Nachname"
                    value={newUser.lastName}
                    onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                  />
                </div>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    background: "#1f2937",
                    color: "#fff"
                  }}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn">
                  Benutzer erstellen
                </button>
              </form>
            </div>
          )}

          <div style={{ display: "grid", gap: "16px" }}>
            {users.map(user => {
              const roleInfo = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.worker
              return (
                <div key={user.id} className="card" style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: user.isActive ? 1 : 0.6
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: roleInfo.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px"
                    }}>
                      {roleInfo.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#e7ebf3" }}>
                        {user.firstName} {user.lastName} {!user.isActive && '(Inaktiv)'}
                      </h4>
                      <p style={{ margin: 0, color: "#9ca3af" }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <select
                      value={user.role}
                      onChange={e => updateUserRole(user.id, e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #333",
                        background: "#1f2937",
                        color: "#fff",
                        fontSize: "14px"
                      }}
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className="btn"
                      style={{
                        backgroundColor: user.isActive ? "#ef4444" : "#059669",
                        fontSize: "12px",
                        padding: "6px 12px"
                      }}
                    >
                      {user.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AdminOnly>
    </RequireAuth>
  )
}
