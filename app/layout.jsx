import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { Navigation } from '../components/Navigation'

export const metadata = { title: 'Shift Planner', description: 'PocketBase Planner' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><link rel="icon" href="/favicon.ico" /></head>
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}