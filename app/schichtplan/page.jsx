'use client'
import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAuth } from '../../context/AuthContext'
import { RequireAuth } from '../../components/RequireAuth'
import { RoleGuard } from '../../components/RoleGuard'
import pb from '../../lib/pb'

// Station configuration
const STATIONS = [
  { id: 'beizen', name: 'Beizen', shortName: 'Beizen', color: '#3b82f6' },
  { id: 'he-bad', name: 'HE-Bad', shortName: 'HE-Bad', color: '#f97316' },
  { id: 'faerben', name: 'Färben', shortName: 'Färben', color: '#eab308' },
  { id: 'chromatieren', name: 'Chromatieren / Pass.', shortName: 'Chromat.', color: '#80b380' },
  { id: 'beschichtung', name: 'Arbeitsplatz Beschichtung', shortName: 'Beschichtung', color: '#06b6d4' },
  { id: 'halle', name: 'Arbeitsplatz Halle', shortName: 'Halle', color: '#8b5cf6' },
  { id: 'schlosserei', name: 'Schlosserei', shortName: 'Schlosserei', color: '#ec4899' },
  { id: 'aufsteckerei', name: 'Aufsteckerei', shortName: 'Aufsteckerei', color: '#f59e0b' },
  { id: 'abdeckerei', name: 'Abdeckerei', shortName: 'Abdeckerei', color: '#80b380' },
  { id: 'instandhaltung', name: 'Instandhaltung', shortName: 'Instandhaltung', color: '#6b7280' }
]

const DAYS = [
  { id: 'monday', name: 'Montag', short: 'Mo' },
  { id: 'tuesday', name: 'Dienstag', short: 'Di' },
  { id: 'wednesday', name: 'Mittwoch', short: 'Mi' },
  { id: 'thursday', name: 'Donnerstag', short: 'Do' },
  { id: 'friday', name: 'Freitag', short: 'Fr' }
]

const WORKER_STATUS_OPTIONS = [
  { value: 'available', label: 'Verfügbar', icon: '✅', color: '#80b380' },
  { value: 'krank', label: 'Krank', icon: '🤒', color: '#ef4444' },
  { value: 'urlaub', label: 'Urlaub', icon: '🏖️', color: '#3b82f6' },
  { value: 'inactive', label: 'Inaktiv', icon: '🚫', color: '#6b7280' }
]

export default function Schichtplan() {
  console.log('🎬 Schichtplan component rendering')
  const { user } = useAuth()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [plan, setPlan] = useState({})
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [retryCount, setRetryCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [workerStatus, setWorkerStatus] = useState({})
  const [workerNotes, setWorkerNotes] = useState({})
  const [editingNotes, setEditingNotes] = useState({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedWorker && !event.target.closest('.clickable-worker') && !event.target.closest('.worker-status-dropdown')) {
        console.log('🖱️ Clicking outside, closing dropdown')
        setSelectedWorker(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedWorker])

  // Monitor workerStatus changes
  useEffect(() => {
    console.log('🔄 workerStatus state changed:', workerStatus)
  }, [workerStatus])

  // Initialize plan structure
  useEffect(() => {
    const initPlan = {}
    STATIONS.forEach(station => {
      initPlan[station.id] = {}
      DAYS.forEach(day => {
        initPlan[station.id][day.id] = []
      })
    })
    setPlan(initPlan)
  }, [])

  // Load workers
  useEffect(() => {
    console.log('🚀 useEffect triggered - starting to load workers')
    let isMounted = true
    let abortController = new AbortController()
    
    const loadWorkers = async () => {
      console.log('🔄 loadWorkers function called')
      try {
        setLoading(true)
        setError(null)
        
        // Add a small delay to prevent rapid requests
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!isMounted) return
        
        // Test PocketBase connection first
        console.log('🏥 Testing PocketBase health...')
        try {
          await pb.health.check()
          console.log('✅ PocketBase health check passed')
        } catch (healthErr) {
          console.log('❌ PocketBase health check failed:', healthErr)
          if (isMounted) {
            setError('PocketBase läuft nicht. Bitte starten Sie: ./pocketbase serve')
            setLoading(false)
            return
          }
        }
        
        // Fetch all users for testing
        console.log('🔍 Fetching ALL users from PocketBase...')
        
        const allUsers = await pb.collection('users').getFullList()
        console.log('📋 ALL USERS IN COLLECTION:')
        console.log('📊 Total users found:', allUsers.length)
        console.log('📋 Users array:', allUsers)
        
        // Log each user individually
        allUsers.forEach((user, index) => {
          console.log(`👤 USER ${index + 1}:`, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            created: user.created,
            updated: user.updated
          })
        })
        
        const records = allUsers
        
        if (isMounted) {
          // Filter on client side
          const activeWorkers = records.filter(user => 
            user.isActive !== false && 
            (user.role === 'worker' || user.role === 'manager')
          )
          
          console.log('👥 Filtered workers:', activeWorkers)
          console.log('📈 Number of workers after filtering:', activeWorkers.length)
          
          // Log each user's details for debugging
          records.forEach((user, index) => {
            console.log(`👤 User ${index + 1}:`, {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              isActive: user.isActive,
              willShow: user.isActive !== false && (user.role === 'worker' || user.role === 'manager')
            })
          })
          
          setWorkers(activeWorkers)
        }
      } catch (err) {
        console.log('❌ Error in loadWorkers:', err)
        console.log('❌ Error type:', typeof err)
        console.log('❌ Error message:', err.message)
        console.log('❌ Error status:', err.status)
        
        // Ignore autocancellation errors
        if (err.message && err.message.includes('autocancelled')) {
          console.log('Request was cancelled, ignoring...')
          return
        }
        
        console.error('Error loading workers:', err)
        if (isMounted) {
          if (err.status === 400) {
            setError('PocketBase Collection "users" nicht gefunden. Bitte folgen Sie der POCKETBASE_SETUP.md Anleitung.')
          } else if (err.status === 0) {
            setError('PocketBase läuft nicht. Bitte starten Sie: ./pocketbase serve')
          } else {
            setError('Fehler beim Laden der Mitarbeiter: ' + err.message)
          }
        }
      } finally {
        console.log('🏁 loadWorkers finally block - isMounted:', isMounted)
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    loadWorkers()
    
    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [])

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result
    
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // Extract worker ID from draggableId
    const workerId = draggableId.split('-')[0]
    const worker = workers.find(w => w.id === workerId)
    
    if (!worker) {
      addNotification('Worker not found', 'error')
      return
    }

    console.log('🔄 Drag operation:', { source, destination, workerId, worker })

    setPlan(prev => {
      const newPlan = JSON.parse(JSON.stringify(prev)) // Deep clone to prevent mutations
      
      // Handle different drag scenarios
      if (source.droppableId === 'workers' && destination.droppableId !== 'workers') {
        // Dragging from pool to station
        const [destStation, destDay] = destination.droppableId.split('|')
        
        // Check if worker is already in this station
        const existingWorkers = newPlan[destStation]?.[destDay] || []
        if (existingWorkers.some(w => w.id === workerId)) {
          addNotification('Worker already assigned to this station', 'error')
          return prev
        }

        // Add worker to destination station
        newPlan[destStation] = newPlan[destStation] || {}
        newPlan[destStation][destDay] = [...existingWorkers, worker]
        
        console.log('✅ Added worker to station:', { destStation, destDay, worker })

      } else if (source.droppableId !== 'workers' && destination.droppableId !== 'workers') {
        // Dragging from station to station
        const [sourceStation, sourceDay] = source.droppableId.split('|')
        const [destStation, destDay] = destination.droppableId.split('|')

        // Check if worker is already in destination station
        const destWorkers = newPlan[destStation]?.[destDay] || []
        if (destWorkers.some(w => w.id === workerId)) {
          addNotification('Worker already assigned to this station', 'error')
          return prev
        }

        // Remove from source station
        newPlan[sourceStation][sourceDay] = newPlan[sourceStation][sourceDay].filter(
          (_, index) => index !== source.index
        )
        
        // Add to destination station
        newPlan[destStation] = newPlan[destStation] || {}
        newPlan[destStation][destDay] = [...destWorkers, worker]
        
        console.log('✅ Moved worker between stations:', { sourceStation, sourceDay, destStation, destDay, worker })

      } else if (source.droppableId !== 'workers' && destination.droppableId === 'workers') {
        // Dragging from station back to pool
        const [sourceStation, sourceDay] = source.droppableId.split('|')

        // Remove from source station
        newPlan[sourceStation][sourceDay] = newPlan[sourceStation][sourceDay].filter(
          (_, index) => index !== source.index
        )
        
        console.log('✅ Removed worker from station:', { sourceStation, sourceDay, worker })
      }
      
      return newPlan
    })
  }

  const getWeekDates = (date) => {
    const monday = new Date(date)
    monday.setDate(date.getDate() - date.getDay() + 1)
    
    return DAYS.map((_, index) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + index)
      return day
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  // Business Rules Validation Functions
  const getWorkerAssignments = (workerId) => {
    const assignments = []
    STATIONS.forEach(station => {
      DAYS.forEach(day => {
        const stationWorkers = plan[station.id]?.[day.id] || []
        if (stationWorkers.some(w => w.id === workerId)) {
          assignments.push({ station: station.id, day: day.id, stationName: station.name, dayName: day.name })
        }
      })
    })
    return assignments
  }

  const isWorkerFullyAssigned = (workerId) => {
    // Check if worker is assigned to at least one station for each day (Monday to Friday)
    const assignments = getWorkerAssignments(workerId)
    const assignedDays = new Set(assignments.map(a => a.day))
    
    // Worker is fully assigned if they have at least one station for each day
    return DAYS.every(day => assignedDays.has(day.id))
  }

  const getStationWorkers = (stationId, dayId) => {
    return plan[stationId]?.[dayId] || []
  }

  const canAssignWorker = (workerId, stationId, dayId) => {
    const worker = workers.find(w => w.id === workerId)
    if (!worker) return { valid: false, reason: 'Worker not found' }

    // Rule 1: Worker must be active
    if (worker.isActive === false) {
      return { valid: false, reason: 'Worker is inactive' }
    }

    // Rule 2: Station cannot have duplicate workers
    const stationWorkers = getStationWorkers(stationId, dayId)
    if (stationWorkers.some(w => w.id === workerId)) {
      return { valid: false, reason: 'Worker already assigned to this station' }
    }

    return { valid: true }
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const getWorkerStatus = (workerId) => {
    return workerStatus[workerId] || 'available'
  }

  const setWorkerStatusValue = (workerId, status) => {
    console.log('🔄 setWorkerStatusValue called:', { workerId, status })
    console.log('🔄 Current workerStatus before:', workerStatus)
    
    setWorkerStatus(prev => {
      const newStatus = {
        ...prev,
        [workerId]: status
      }
      console.log('🔄 New workerStatus:', newStatus)
      return newStatus
    })
    setSelectedWorker(null)
    console.log('🔄 Status change completed')
  }

  const getWorkerNote = (workerId, stationId, dayId) => {
    const key = `${workerId}-${stationId}-${dayId}`
    return workerNotes[key] || ''
  }

  const setWorkerNote = (workerId, stationId, dayId, note) => {
    const key = `${workerId}-${stationId}-${dayId}`
    setWorkerNotes(prev => ({
      ...prev,
      [key]: note
    }))
  }

  const isEditingNote = (workerId, stationId, dayId) => {
    const key = `${workerId}-${stationId}-${dayId}`
    return editingNotes[key] || false
  }

  const setEditingNote = (workerId, stationId, dayId, isEditing) => {
    const key = `${workerId}-${stationId}-${dayId}`
    setEditingNotes(prev => ({
      ...prev,
      [key]: isEditing
    }))
  }

  const saveNote = (workerId, stationId, dayId) => {
    setEditingNote(workerId, stationId, dayId, false)
  }

  const cancelNoteEdit = (workerId, stationId, dayId) => {
    setEditingNote(workerId, stationId, dayId, false)
  }

  const getWorkerStatusInfo = (workerId) => {
    const status = getWorkerStatus(workerId)
    return WORKER_STATUS_OPTIONS.find(option => option.value === status) || WORKER_STATUS_OPTIONS[0]
  }

      const getAvailableWorkers = () => {
        console.log('📋 getAvailableWorkers called')
        console.log('📋 Current workers state:', workers)
        console.log('📋 Number of workers in state:', workers.length)
        console.log('📋 Current worker status state:', workerStatus)
        
        // Filter to show only workers and managers who are active AND available
        const eligibleWorkers = workers.filter(worker => {
          const workerStatusValue = getWorkerStatus(worker.id)
          const isEligible = (worker.role === 'worker' || worker.role === 'manager') &&
            worker.isActive !== false &&
            (workerStatusValue === 'available' || workerStatusValue === undefined)
          
          console.log(`📋 Worker ${worker.firstName} (${worker.id}): role=${worker.role}, isActive=${worker.isActive}, status=${workerStatusValue}, eligible=${isEligible}`)
          return isEligible
        })
        
        console.log('📋 Eligible workers (worker/manager + active + available):', eligibleWorkers)
        
        // Filter by worker status and assignment status
        const availableWorkers = eligibleWorkers.filter(worker => {
          const workerStatusValue = getWorkerStatus(worker.id)
          const isFullyAssigned = isWorkerFullyAssigned(worker.id)
          
          // Only show workers who are available and not fully assigned
          return workerStatusValue === 'available' && !isFullyAssigned
        })
        
        console.log('📋 Available workers (available status + not fully assigned):', availableWorkers)
        console.log('📋 Number of available workers:', availableWorkers.length)
        
        return availableWorkers
      }

      const getUnavailableWorkers = () => {
        // Get all workers (active and inactive)
        const allWorkers = workers.filter(worker => 
          worker.role === 'worker' || worker.role === 'manager'
        )
        
        // Separate into unavailable categories
        const inactiveWorkers = allWorkers.filter(worker => worker.isActive === false)
        const fullyAssignedWorkers = allWorkers.filter(worker => 
          worker.isActive !== false && isWorkerFullyAssigned(worker.id)
        )
        const krankWorkers = allWorkers.filter(worker => 
          worker.isActive !== false && getWorkerStatus(worker.id) === 'krank'
        )
        const urlaubWorkers = allWorkers.filter(worker => 
          worker.isActive !== false && getWorkerStatus(worker.id) === 'urlaub'
        )
        
        return {
          inactive: inactiveWorkers,
          fullyAssigned: fullyAssignedWorkers,
          krank: krankWorkers,
          urlaub: urlaubWorkers,
          total: inactiveWorkers.length + fullyAssignedWorkers.length + krankWorkers.length + urlaubWorkers.length
        }
      }

  const clearStation = (stationId, dayId) => {
    setPlan(prev => ({
      ...prev,
      [stationId]: {
        ...prev[stationId],
        [dayId]: []
      }
    }))
  }

  const clearAll = () => {
    const emptyPlan = {}
    STATIONS.forEach(station => {
      emptyPlan[station.id] = {}
      DAYS.forEach(day => {
        emptyPlan[station.id][day.id] = []
      })
    })
    setPlan(emptyPlan)
    addNotification('🗑️ Schichtplan wurde geleert. Alle Zuweisungen wurden entfernt.', 'info')
  }

  // Check if all stations are filled for each day
  const getStationStatus = () => {
    const status = {}
    DAYS.forEach(day => {
      status[day.id] = {
        day: day.name,
        filledStations: 0,
        totalStations: STATIONS.length,
        isComplete: false
      }
      
      STATIONS.forEach(station => {
        const workers = plan[station.id]?.[day.id] || []
        if (workers.length > 0) {
          status[day.id].filledStations++
        }
      })
      
      status[day.id].isComplete = status[day.id].filledStations === status[day.id].totalStations
    })
    
    return status
  }

  const getOverallStatus = () => {
    const stationStatus = getStationStatus()
    const totalDays = DAYS.length
    const completeDays = Object.values(stationStatus).filter(day => day.isComplete).length
    const availableWorkers = getAvailableWorkers()
    
    return {
      completeDays,
      totalDays,
      availableWorkers: availableWorkers.length,
      isFullyPlanned: completeDays === totalDays && availableWorkers.length === 0
    }
  }

  // Check for completion and show notification
  useEffect(() => {
    const status = getOverallStatus()
    if (status.isFullyPlanned) {
      addNotification('🎉 Wöchentlicher Schichtplan ist vollständig! Alle Stationen sind besetzt und alle Mitarbeiter haben ihre Schichten.', 'success')
    }
  }, [plan]) // Trigger when plan changes

  const retryLoadWorkers = async () => {
    setError(null)
    setRetryCount(prev => prev + 1)
    setLoading(true)
    
    try {
      const records = await pb.collection('users').getFullList({
        sort: 'firstName,lastName'
      })
      
      console.log('🔄 Retry - Raw users from PocketBase:', records)
      console.log('🔄 Retry - Number of users found:', records.length)
      
      const activeWorkers = records.filter(user => 
        user.isActive !== false && 
        (user.role === 'worker' || user.role === 'manager')
      )
      
      console.log('🔄 Retry - Filtered workers:', activeWorkers)
      console.log('🔄 Retry - Number of workers after filtering:', activeWorkers.length)
      
      setWorkers(activeWorkers)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      if (err.message && err.message.includes('autocancelled')) {
        console.log('Request was cancelled, ignoring...')
        return
      }
      
      console.error('Retry failed:', err)
      if (err.status === 400) {
        setError('PocketBase Collection "users" nicht gefunden. Bitte folgen Sie der POCKETBASE_SETUP.md Anleitung.')
      } else if (err.status === 0) {
        setError('PocketBase läuft nicht. Bitte starten Sie: ./pocketbase serve')
      } else {
        setError('Fehler beim Laden der Mitarbeiter: ' + err.message)
      }
    } finally {
      setLoading(false)
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
            <p style={{ color: "#9ca3af" }}>Lade Schichtplan...</p>
          </div>
        </RoleGuard>
      </RequireAuth>
    )
  }


  return (
    <RequireAuth>
      <RoleGuard requiredRole="manager">
        <div className="container-fluid bg-dark text-light min-vh-100">
          <div className="container py-4">
            <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
            <div>
                <h1 className="h2 mb-2 text-light">
                📅 Schichtplan
              </h1>
                <p className="text-muted mb-0">
                Ziehen Sie Mitarbeiter zu den Stationen für jeden Tag
              </p>
            </div>
              <div className="d-flex gap-2">
                <button onClick={clearAll} className="btn btn-danger">
                Alle löschen
              </button>
                <button className="btn btn-success">
                Plan speichern
              </button>
            </div>
          </header>

          {/* Status Display */}
          {(() => {
            const status = getOverallStatus()
            const stationStatus = getStationStatus()
            
            return (
              <div className="card bg-dark border-secondary mb-4">
                <div className="card-body">
                  <h5 className="card-title text-light mb-3">📊 Planungsstatus</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card bg-secondary border-0">
                        <div className="card-body p-3">
                          <div className="text-muted small">Verfügbare Mitarbeiter</div>
                          <div className="h4 text-light mb-0">{status.availableWorkers}</div>
                  </div>
                  </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-secondary border-0">
                        <div className="card-body p-3">
                          <div className="text-muted small">Vollständige Tage</div>
                          <div className="h4 text-light mb-0">{status.completeDays}/{status.totalDays}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-secondary border-0">
                        <div className="card-body p-3">
                          <div className="text-muted small">Status</div>
                          <div className={`fw-bold ${status.isFullyPlanned ? 'text-success' : 'text-warning'}`}>
                      {status.isFullyPlanned ? "✅ Vollständig geplant" : "⏳ In Bearbeitung"}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Day-by-day status */}
                  <div className="mt-3">
                    <div className="text-muted small mb-2">Tagesstatus:</div>
                    <div className="d-flex flex-wrap gap-2">
                    {Object.values(stationStatus).map(day => (
                        <span key={day.day} className={`badge ${day.isComplete ? 'bg-success' : 'bg-secondary'}`}>
                        {day.day}: {day.filledStations}/{day.totalStations}
                        </span>
                    ))}
                  </div>
                </div>
                
                {/* Unavailable Workers */}
                {(() => {
                  const unavailable = getUnavailableWorkers()
                  if (unavailable.total === 0) return null
                  
                  const allUnavailableWorkers = [
                    ...unavailable.inactive.map(w => ({ ...w, status: 'inactive' })),
                    ...unavailable.krank.map(w => ({ ...w, status: 'krank' })),
                    ...unavailable.urlaub.map(w => ({ ...w, status: 'urlaub' })),
                    ...unavailable.fullyAssigned.map(w => ({ ...w, status: 'assigned' }))
                  ]
                  
                  return (
                    <div className="mt-4">
                      <div className="text-muted small mb-2">
                        Nicht verfügbare Mitarbeiter ({unavailable.total}):
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {allUnavailableWorkers.map((worker, index) => {
                          const statusInfo = worker.status === 'inactive' ? 
                            { icon: '🚫', color: 'secondary', label: 'Inaktiv' } :
                            worker.status === 'krank' ? 
                            { icon: '🤒', color: 'danger', label: 'Krank' } :
                            worker.status === 'urlaub' ? 
                            { icon: '🏖️', color: 'info', label: 'Urlaub' } :
                            { icon: '✓', color: 'success', label: 'Vollständig zugewiesen' }
                          
                          return (
                            <div
                              key={`unavailable-${worker.id}-${index}`}
                              className={`badge bg-${statusInfo.color} text-dark d-flex align-items-center gap-1`}
                              style={{
                                cursor: "pointer",
                                position: "relative",
                                minWidth: "100px",
                                textAlign: "center",
                                transition: "all 0.2s",
                                zIndex: selectedWorker === worker.id ? 10000 : 1
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "scale(1.05)"
                                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "scale(1)"
                                e.target.style.boxShadow = "none"
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('🖱️ Worker chip clicked:', worker.id, 'current selected:', selectedWorker)
                                setSelectedWorker(selectedWorker === worker.id ? null : worker.id)
                                console.log('🖱️ After click, selectedWorker will be:', selectedWorker === worker.id ? null : worker.id)
                              }}
                            >
                              {statusInfo.icon} {worker.firstName} {worker.lastName} ({statusInfo.label})
                              
                              {/* Status Dropdown for Unavailable Workers */}
                              {console.log('🔍 Checking dropdown for worker:', worker.id, 'selectedWorker:', selectedWorker, 'should show:', selectedWorker === worker.id)}
                              {selectedWorker === worker.id && (
                                <div style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "0",
                                  right: "0",
                                  background: "#1f2937",
                                  border: "3px solid #10b981",
                                  borderRadius: "6px",
                                  padding: "8px",
                                  zIndex: 10001,
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                                  marginTop: "4px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  minWidth: "150px",
                                  maxWidth: "200px",
                                  isolation: "isolate",
                                  overflow: "hidden"
                                }}>
                                  {WORKER_STATUS_OPTIONS.map(option => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        background: "#374151",
                                        border: "1px solid #4b5563",
                                        color: option.color,
                                        textAlign: "left",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        transition: "all 0.2s",
                                        margin: "0",
                                        outline: "none",
                                        userSelect: "none",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log('🔄 Button mousedown! Changing worker status:', worker.id, 'to', option.value)
                                        console.log('🔄 Worker details:', worker)
                                        console.log('🔄 Current workerStatus before click:', workerStatus)
                                        
                                        // Force the status change
                                        setWorkerStatus(prev => {
                                          const newStatus = {
                                            ...prev,
                                            [worker.id]: option.value
                                          }
                                          console.log('🔄 Setting new status:', newStatus)
                                          return newStatus
                                        })
                                        
                                        // Close dropdown
                                        setSelectedWorker(null)
                                        console.log('🔄 Status change completed')
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.background = "#4b5563"
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.background = "#374151"
                                      }}
                                    >
                                      {option.icon} {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })()

          {error && (
            <div style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#ef4444"
            }}>
              <strong>Fehler:</strong> {error}
              <div style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
                💡 <strong>Lösung:</strong>
                <br />1. Starten Sie PocketBase: <code>./pocketbase serve</code>
                <br />2. Öffnen Sie: <a href="http://127.0.0.1:8090/_/" target="_blank" style={{color: "#2563eb"}}>http://127.0.0.1:8090/_/</a>
                <br />3. Erstellen Sie "users" Collection (Typ: Auth)
                <br />4. Fügen Sie Felder hinzu: role, firstName, lastName, isActive
                <br />5. Erstellen Sie Test-Benutzer
              </div>
              <button 
                onClick={retryLoadWorkers} 
                disabled={loading}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: loading ? "#6b7280" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? '⏳ Lädt...' : `🔄 Erneut versuchen ${retryCount > 0 ? `(${retryCount})` : ''}`}
              </button>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    color: "white",
                    backgroundColor: 
                      notification.type === 'error' ? "#ef4444" :
                      notification.type === 'success' ? "#80b380" :
                      notification.type === 'warning' ? "#f59e0b" : "#3b82f6",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    maxWidth: "400px",
                    animation: "slideIn 0.3s ease-out"
                  }}
                >
                  {notification.type === 'error' && '❌ '}
                  {notification.type === 'success' && '✅ '}
                  {notification.type === 'warning' && '⚠️ '}
                  {notification.type === 'info' && 'ℹ️ '}
                  {notification.message}
                </div>
              ))}
            </div>
          )}

              <DragDropContext onDragEnd={handleDragEnd}>
              <div className="row g-4">
                  {/* Workers Pool - Only Available Workers */}
                <div className="col-lg-3">
                  <div className="card bg-dark border-secondary h-100">
                    <div className="card-header">
                      <h5 className="card-title text-light mb-0">
                      Verfügbare Mitarbeiter ({getAvailableWorkers().length})
                      </h5>
                    </div>
                    <Droppable droppableId="workers">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`card-body ${snapshot.isDraggingOver ? 'bg-secondary' : ''}`}
                          style={{ minHeight: "300px" }}
                        >
                          {getAvailableWorkers().length === 0 ? (
                            <div className="text-muted text-center py-5">
                              Keine verfügbaren Mitarbeiter
                            </div>
                          ) : (
                            getAvailableWorkers().map((worker, index) => (
                            <Draggable key={`worker-${worker.id}-${index}`} draggableId={worker.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`card mb-2 ${snapshot.isDragging ? 'bg-primary' : 'bg-secondary'} text-light`}
                              style={{
                                transform: snapshot.isDragging ? "scale(1.05)" : "scale(1)",
                                    transition: "all 0.2s ease",
                                    cursor: "grab",
                                ...provided.draggableProps.style
                              }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedWorker(selectedWorker === worker.id ? null : worker.id)
                                  }}
                                >
                                  <div className="card-body p-2">
                                    <span className="text-light fw-medium">
                                  {worker.firstName}
                                  </span>
                                  </div>
                                  
                                  {/* Status Dropdown */}
                                  {selectedWorker === worker.id && (
                                    <div style={{
                                      position: "absolute",
                                      top: "100%",
                                      left: "0",
                                      background: "#1f2937",
                                      border: "1px solid #4b5563",
                                      borderRadius: "6px",
                                      padding: "4px",
                                      zIndex: 10001,
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                                      marginTop: "4px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "2px",
                                      minWidth: "140px",
                                      maxWidth: "200px"
                                    }}>
                                      {WORKER_STATUS_OPTIONS.map(option => (
                                        <button
                                          key={option.value}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setWorkerStatusValue(worker.id, option.value)
                                          }}
                                          style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            background: "#374151",
                                            border: "1px solid #4b5563",
                                            color: option.color,
                                            textAlign: "left",
                                            cursor: "pointer",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            transition: "all 0.2s",
                                            margin: "0",
                                            outline: "none",
                                            userSelect: "none",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.background = "#4b5563"
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.background = "#374151"
                                          }}
                                        >
                                          {option.icon} {option.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Shift Plan Table - Always Visible */}
                <div className="col-lg-9">
                  <div className="card bg-dark border-success">
                    <div className="card-header bg-success text-dark">
                      <h5 className="card-title mb-0">Schichtplan Tabelle</h5>
                      </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-dark table-bordered mb-0">
                          <thead>
                            <tr>
                              <th className="bg-secondary text-light text-center" style={{ width: '140px' }}>Station</th>
                      {DAYS.map(day => (
                                <th key={day.id} className="bg-secondary text-light text-center">
                          {day.short}
                          <br />
                                  <small className="text-muted">
                            {formatDate(getWeekDates(selectedWeek)[DAYS.indexOf(day)])}
                          </small>
                                </th>
                      ))}
                            </tr>
                          </thead>
                          <tbody>
                  {STATIONS.map(station => (
                              <tr key={station.id}>
                                <td 
                                  className="bg-secondary text-light text-center fw-bold"
                                  style={{ borderLeft: `4px solid ${station.color}` }}
                      >
                        {station.shortName}
                                </td>
                      {DAYS.map(day => (
                        <Droppable key={`${station.id}|${day.id}`} droppableId={`${station.id}|${day.id}`}>
                          {(provided, snapshot) => (
                                      <td
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                                        className={`${snapshot.isDraggingOver ? 'bg-secondary' : 'bg-dark'} position-relative`}
                                        style={{ 
                                          minHeight: "80px",
                                          verticalAlign: "top",
                                          padding: "8px"
                                        }}
                            >
                              {plan[station.id]?.[day.id]?.map((worker, index) => (
                                <Draggable key={`${station.id}-${day.id}-${worker.id}-${index}`} draggableId={`${worker.id}-${station.id}-${day.id}-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`card mb-2 ${snapshot.isDragging ? 'bg-primary' : 'bg-secondary'} text-light`}
                                      style={{
                                        transform: snapshot.isDragging ? "scale(1.05)" : "scale(1)",
                                        transition: "all 0.2s ease",
                                        cursor: "grab",
                                        ...provided.draggableProps.style
                                      }}
                                      onMouseEnter={(e) => {
                                        const buttons = e.currentTarget.querySelector('.action-buttons')
                                        if (buttons) buttons.style.opacity = "1"
                                      }}
                                      onMouseLeave={(e) => {
                                        const buttons = e.currentTarget.querySelector('.action-buttons')
                                        if (buttons) buttons.style.opacity = "0"
                                      }}
                                    >
                                      {/* Worker Header */}
                                      <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px"
                                      }}>
                                        <div className="card-body p-2">
                                          <span className="text-light fw-medium">
                                            {worker.firstName}
                                        </span>
                                      </div>
                                      
                                        {/* Action Buttons - Show on Hover */}
                                        <div className="action-buttons" style={{
                                          display: "flex",
                                          gap: "4px",
                                          opacity: 0,
                                          transition: "opacity 0.2s ease"
                                        }}
                                        >
                                          {/* Edit Note Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setEditingNote(worker.id, station.id, day.id, true)
                                            }}
                                            style={{
                                              width: "16px",
                                              height: "16px",
                                              borderRadius: "50%",
                                              backgroundColor: "#6b7280",
                                              border: "none",
                                              color: "white",
                                              fontSize: "8px",
                                              cursor: "pointer",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                              e.target.style.backgroundColor = "#4b5563"
                                              e.target.style.transform = "scale(1.1)"
                                            }}
                                            onMouseLeave={(e) => {
                                              e.target.style.backgroundColor = "#6b7280"
                                              e.target.style.transform = "scale(1)"
                                            }}
                                          >
                                            ✏️
                                          </button>
                                          
                                          {/* Remove Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              // Remove worker from station
                                              setPlan(prev => ({
                                                ...prev,
                                                [station.id]: {
                                                  ...prev[station.id],
                                                  [day.id]: prev[station.id][day.id].filter((_, idx) => idx !== index)
                                                }
                                              }))
                                            }}
                                            style={{
                                              width: "16px",
                                              height: "16px",
                                              borderRadius: "50%",
                                              backgroundColor: "#ef4444",
                                              border: "none",
                                              color: "white",
                                              fontSize: "10px",
                                              cursor: "pointer",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                              e.target.style.backgroundColor = "#dc2626"
                                              e.target.style.transform = "scale(1.1)"
                                            }}
                                            onMouseLeave={(e) => {
                                              e.target.style.backgroundColor = "#ef4444"
                                              e.target.style.transform = "scale(1)"
                                            }}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Note Section - Only show if note exists or editing */}
                                      {(getWorkerNote(worker.id, station.id, day.id) || isEditingNote(worker.id, station.id, day.id)) && (
                                        <div style={{ marginTop: "4px" }}>
                                          {isEditingNote(worker.id, station.id, day.id) ? (
                                            <div style={{
                                              display: "flex",
                                              gap: "4px",
                                              alignItems: "center"
                                            }}>
                                        <input
                                          type="text"
                                                placeholder="Notiz hinzufügen..."
                                          value={getWorkerNote(worker.id, station.id, day.id)}
                                          onChange={(e) => setWorkerNote(worker.id, station.id, day.id, e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    saveNote(worker.id, station.id, day.id)
                                                  } else if (e.key === 'Escape') {
                                                    cancelNoteEdit(worker.id, station.id, day.id)
                                                  }
                                                }}
                                                autoFocus
                                                style={{
                                                  flex: 1,
                                                  padding: "4px 8px",
                                                  fontSize: "10px",
                                                  border: "1px solid #6b7280",
                                                  borderRadius: "4px",
                                                  backgroundColor: "#1f2937",
                                                  color: "#e7ebf3",
                                                  outline: "none",
                                                  transition: "all 0.2s ease"
                                                }}
                                              />
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  saveNote(worker.id, station.id, day.id)
                                                }}
                                                style={{
                                                  width: "18px",
                                                  height: "18px",
                                                  borderRadius: "3px",
                                                  backgroundColor: "#6b7280",
                                                  border: "none",
                                                  color: "white",
                                                  cursor: "pointer",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  fontSize: "8px",
                                                  transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.target.style.backgroundColor = "#4b5563"
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.target.style.backgroundColor = "#6b7280"
                                                }}
                                              >
                                                ✓
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  cancelNoteEdit(worker.id, station.id, day.id)
                                                }}
                                                style={{
                                                  width: "18px",
                                                  height: "18px",
                                                  borderRadius: "3px",
                                                  backgroundColor: "#6b7280",
                                                  border: "none",
                                                  color: "white",
                                                  cursor: "pointer",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  fontSize: "8px",
                                                  transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.target.style.backgroundColor = "#4b5563"
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.target.style.backgroundColor = "#6b7280"
                                                }}
                                              >
                                                ×
                                              </button>
                                      </div>
                                          ) : (
                                            <div style={{
                                              padding: "4px 6px",
                                              backgroundColor: "#1f2937",
                                              border: "1px solid #4b5563",
                                              borderRadius: "4px",
                                              fontSize: "10px",
                                              color: "#9ca3af",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "4px"
                                            }}>
                                              <span style={{ fontSize: "8px" }}>📝</span>
                                              <span style={{ 
                                                overflow: "hidden", 
                                                textOverflow: "ellipsis", 
                                                whiteSpace: "nowrap",
                                                maxWidth: "100px"
                                              }}>
                                                {getWorkerNote(worker.id, station.id, day.id)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                                      </td>
                          )}
                        </Droppable>
                      ))}
                              </tr>
                  ))}
                      </tbody>
                    </table>
                  </div>   {/* closes .table-responsive */}
                </div>     {/* closes .card-body */}
              </div>       {/* closes .card */}
            </div>         {/* closes .col-lg-9 */}
          </div>           {/* closes .row g-4 */}
        </DragDropContext> {/* closes DragDropContext */}
      </div>               {/* closes .container */}
    </div>                 {/* closes .container-fluid */}
    </div>
    </div>
  </RoleGuard>
</RequireAuth>
)
}

