'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { RequireAuth } from '../../components/RequireAuth'
import { RoleGuard } from '../../components/RoleGuard'
import { ROLE_PERMISSIONS, getAllRoles } from '../../lib/roles'
import pb from '../../lib/pb'

export default function Mitarbeiter() {
  const { user } = useAuth()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState(null)
  const [newWorker, setNewWorker] = useState({
    email: '',
    password: '',
    role: 'worker',
    firstName: '',
    lastName: '',
    isActive: true
  })

  const roles = getAllRoles()

  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('users').getFullList({
        sort: 'firstName,lastName'
      })
      setWorkers(records)
    } catch (err) {
      console.error('Error loading workers:', err)
      setError('Fehler beim Laden der Mitarbeiter: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWorker = async (e) => {
    e.preventDefault()
    try {
      await pb.collection('users').create({
        ...newWorker,
        passwordConfirm: newWorker.password
      })
      setNewWorker({
        email: '',
        password: '',
        role: 'worker',
        firstName: '',
        lastName: '',
        isActive: true
      })
      setShowAddForm(false)
      loadWorkers()
    } catch (err) {
      setError('Fehler beim Erstellen des Mitarbeiters: ' + err.message)
    }
  }

  const handleEditWorker = async (e) => {
    e.preventDefault()
    try {
      await pb.collection('users').update(editingWorker.id, {
        email: editingWorker.email,
        role: editingWorker.role,
        firstName: editingWorker.firstName,
        lastName: editingWorker.lastName,
        isActive: editingWorker.isActive
      })
      setEditingWorker(null)
      loadWorkers()
    } catch (err) {
      setError('Fehler beim Aktualisieren des Mitarbeiters: ' + err.message)
    }
  }

  const toggleWorkerStatus = async (workerId, currentStatus) => {
    try {
      await pb.collection('users').update(workerId, {
        isActive: !currentStatus
      })
      loadWorkers()
    } catch (err) {
      setError('Fehler beim Aktualisieren des Mitarbeiters: ' + err.message)
    }
  }

  const deleteWorker = async (workerId) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?')) {
      try {
        await pb.collection('users').delete(workerId)
        loadWorkers()
      } catch (err) {
        setError('Fehler beim Löschen des Mitarbeiters: ' + err.message)
      }
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <RoleGuard requiredRole="manager">
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
            <p style={{ color: "#9ca3af" }}>Lade Mitarbeiter...</p>
          </div>
        </RoleGuard>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <RoleGuard requiredRole="manager">
        <div className="container">
          <header className="mitarbeiter-header">
            <div>
              <h1 className="mitarbeiter-title">
                👥 Mitarbeiter
              </h1>
              <p className="mitarbeiter-subtitle">
                Verwalten Sie Mitarbeiter und deren Rollen
              </p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-sm"
            >
              {showAddForm ? 'Abbrechen' : '+ Neuer Mitarbeiter'}
            </button>
          </header>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {showAddForm && (
            <div className="card add-worker-form">
              <h3>Neuen Mitarbeiter hinzufügen</h3>
              <form onSubmit={handleAddWorker} className="worker-form">
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="E-Mail"
                    value={newWorker.email}
                    onChange={e => setNewWorker({...newWorker, email: e.target.value})}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Passwort"
                    value={newWorker.password}
                    onChange={e => setNewWorker({...newWorker, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Vorname"
                    value={newWorker.firstName}
                    onChange={e => setNewWorker({...newWorker, firstName: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Nachname"
                    value={newWorker.lastName}
                    onChange={e => setNewWorker({...newWorker, lastName: e.target.value})}
                  />
                </div>
                <select
                  value={newWorker.role}
                  onChange={e => setNewWorker({...newWorker, role: e.target.value})}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-lg">
                  Mitarbeiter hinzufügen
                </button>
              </form>
            </div>
          )}

          <div className="workers-grid">
            {workers.map(worker => {
              const roleInfo = ROLE_PERMISSIONS[worker.role] || ROLE_PERMISSIONS.worker
              return (
                <div key={worker.id} className={`worker-card ${!worker.isActive ? 'inactive' : ''}`}>
                  <div className="worker-info">
                    <div className="worker-avatar" style={{ backgroundColor: roleInfo.color }}>
                      {roleInfo.icon}
                    </div>
                    <div className="worker-details">
                      <h4 className="worker-name">
                        {worker.firstName} {worker.lastName} {!worker.isActive && '(Inaktiv)'}
                      </h4>
                      <p className="worker-email">
                        {worker.email}
                      </p>
                      <span className="worker-role" style={{ color: roleInfo.color }}>
                        {roleInfo.name}
                      </span>
                    </div>
                  </div>
                  <div className="worker-actions">
                    <button
                      onClick={() => setEditingWorker(worker)}
                      className="btn btn-sm"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => toggleWorkerStatus(worker.id, worker.isActive)}
                      className={`btn btn-sm ${worker.isActive ? 'btn-danger' : 'btn-success'}`}
                    >
                      {worker.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    <button
                      onClick={() => deleteWorker(worker.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Edit Modal */}
          {editingWorker && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Mitarbeiter bearbeiten</h3>
                <form onSubmit={handleEditWorker} className="worker-form">
                  <input
                    type="email"
                    placeholder="E-Mail"
                    value={editingWorker.email}
                    onChange={e => setEditingWorker({...editingWorker, email: e.target.value})}
                    required
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Vorname"
                      value={editingWorker.firstName}
                      onChange={e => setEditingWorker({...editingWorker, firstName: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Nachname"
                      value={editingWorker.lastName}
                      onChange={e => setEditingWorker({...editingWorker, lastName: e.target.value})}
                    />
                  </div>
                  <select
                    value={editingWorker.role}
                    onChange={e => setEditingWorker({...editingWorker, role: e.target.value})}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={editingWorker.isActive}
                      onChange={e => setEditingWorker({...editingWorker, isActive: e.target.checked})}
                    />
                    <label>Aktiv</label>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn">
                      Speichern
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingWorker(null)}
                      className="btn btn-secondary"
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </RequireAuth>
  )
}
