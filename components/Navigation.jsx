'use client'
import { useAuth } from '../context/AuthContext'
import { RoleGuard } from './RoleGuard'
import Link from 'next/link'
import { useMounted } from '../hooks/useMounted'
import { useState } from 'react'

export function Navigation() {
  const { user, logout, getUserRole } = useAuth()
  const mounted = useMounted()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show navigation if user is not authenticated
  if (!mounted || !user) {
    return null
  }

  return (
    <nav style={{
      backgroundColor: "#111827",
      borderBottom: "1px solid #2a3142",
      padding: "12px 0"
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
      }}>
        {/* Logo */}
        <Link href="/" style={{
          color: "#e7ebf3",
          textDecoration: "none",
          fontSize: "18px",
          fontWeight: "600",
          zIndex: 10
        }}>
          Shift Planner
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            {/* Dashboard - Available to all */}
            <Link href="/" style={{
              color: "#9ca3af",
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.2s"
            }}>
              Dashboard
            </Link>

            {/* Schichtplan - Manager and Admin */}
            <RoleGuard requiredRole="manager">
              <Link href="/schichtplan" style={{
                color: "#9ca3af",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s"
              }}>
                Schichtplan
              </Link>
            </RoleGuard>

            {/* Mitarbeiter - Manager and Admin */}
            <RoleGuard requiredRole="manager">
              <Link href="/mitarbeiter" style={{
                color: "#9ca3af",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s"
              }}>
                Mitarbeiter
              </Link>
            </RoleGuard>

            {/* Berichte - Accountant, Manager and Admin */}
            <RoleGuard requiredRole="accountant">
              <Link href="/reports" style={{
                color: "#9ca3af",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s"
              }}>
                Berichte
              </Link>
            </RoleGuard>

            {/* Admin only */}
            <RoleGuard requiredRole="admin">
              <Link href="/admin/users" style={{
                color: "#9ca3af",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s"
              }}>
                Benutzer
              </Link>
            </RoleGuard>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>
              {user?.email}
            </span>
            <button onClick={logout} className="btn btn-sm">
              Abmelden
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            backgroundColor: "#111827",
            border: "1px solid #2a3142",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "16px",
            zIndex: 5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* User Info */}
              <div style={{ 
                padding: "8px 0", 
                borderBottom: "1px solid #2a3142",
                color: "#9ca3af",
                fontSize: "14px"
              }}>
                {user?.email}
              </div>

              {/* Navigation Links */}
              <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{
                color: "#9ca3af",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s"
              }}>
                Dashboard
              </Link>

              <RoleGuard requiredRole="manager">
                <Link href="/schichtplan" onClick={() => setMobileMenuOpen(false)} style={{
                  color: "#9ca3af",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s"
                }}>
                  Schichtplan
                </Link>
              </RoleGuard>

              <RoleGuard requiredRole="manager">
                <Link href="/mitarbeiter" onClick={() => setMobileMenuOpen(false)} style={{
                  color: "#9ca3af",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s"
                }}>
                  Mitarbeiter
                </Link>
              </RoleGuard>

              <RoleGuard requiredRole="accountant">
                <Link href="/reports" onClick={() => setMobileMenuOpen(false)} style={{
                  color: "#9ca3af",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s"
                }}>
                  Berichte
                </Link>
              </RoleGuard>

              <RoleGuard requiredRole="admin">
                <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} style={{
                  color: "#9ca3af",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s"
                }}>
                  Benutzer
                </Link>
              </RoleGuard>

              <button 
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }} 
                className="btn btn-sm"
                style={{ marginTop: "8px" }}
              >
                Abmelden
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
