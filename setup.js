const fs = require("fs");
const path = require("path");

const files = {
  "package.json": `{
  "name": "simplified-pocketbase-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@hello-pangea/dnd": "^16.5.0",
    "pocketbase": "^0.21.1"
  },
  "devDependencies": {
    "eslint": "^8.56.0"
  }
}`,
  ".env.local.example": `NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090`,
  "styles/globals.css": `body { background:#0b0f17; color:#e7ebf3; font-family:sans-serif; margin:0; padding:0; }
.container { padding:20px; max-width:900px; margin:auto; }
.card { background:#111827; padding:20px; border-radius:10px; border:1px solid #2a3142; max-width:400px; margin:auto; }
.card h2 { margin-top:0; }
input { padding:10px; border-radius:6px; border:1px solid #333; background:#1f2937; color:#fff; }
.btn { padding:10px 14px; border-radius:6px; border:none; background:#2563eb; color:white; cursor:pointer; }
.btn:hover { background:#1d4ed8; }
a { color:#3b82f6; }`,

  "app/layout.jsx": `import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'

export const metadata = { title: 'Shift Planner', description: 'PocketBase Planner' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><link rel="icon" href="/favicon.ico" /></head>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}`,
  "app/error.jsx": `'use client'
export default function Error({ error, reset }) {
  return (<div className="container"><h2>Something went wrong!</h2><button className="btn" onClick={()=>reset()}>Try again</button></div>)
}`,
  "app/not-found.jsx": `export default function NotFound(){return(<div className="container"><h2>404 - Page not found</h2></div>)}`,

  "context/AuthContext.jsx": `'use client'
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import pb from '../lib/pb'
const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
  const [user,setUser]=useState(pb.authStore.model)
  useEffect(()=>pb.authStore.onChange(()=>setUser(pb.authStore.model)),[])
  const login=(email,p)=>pb.collection('users').authWithPassword(email,p)
  const register=(email,p)=>pb.collection('users').create({ email, password:p, passwordConfirm:p })
  const resetPassword=(email)=>pb.collection('users').requestPasswordReset(email)
  const logout=()=>pb.authStore.clear()
  const value=useMemo(()=>({user,login,register,resetPassword,logout}),[user])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
export function useAuth(){const ctx=useContext(AuthCtx);if(!ctx)throw new Error('useAuth must be used within AuthProvider');return ctx}`,

  "lib/pb.js": `import PocketBase from 'pocketbase'
const pb=new PocketBase(process.env.NEXT_PUBLIC_PB_URL||'http://127.0.0.1:8090')
export default pb`,

  "components/RequireAuth.jsx": `'use client'
import { useEffect,useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
export function RequireAuth({ children }) {
  const { user }=useAuth(); const router=useRouter(); const [mounted,setMounted]=useState(false)
  useEffect(()=>{setMounted(true)},[])
  useEffect(()=>{if(mounted&&!user)router.replace('/login')},[mounted,user,router])
  if(!mounted) return null
  if(!user) return <p>Checking authentication…</p>
  return children
}`,

  "app/page.jsx": `/* Full Home Planner code goes here – paste from my previous message (long JSX with DragDropContext, Droppable, Draggable) */`,

  "app/login/page.jsx": `/* Full login form code goes here */`,

  "app/register/page.jsx": `/* Full register form code goes here */`,

  "app/forgot-password/page.jsx": `/* Full forgot-password form code goes here */`,

  "pb_schema.json": JSON.stringify({
    users: {
      id: "users",
      name: "users",
      type: "auth",
      schema: [
        { name: "email", type: "email", required: true },
        { name: "password", type: "password", required: true }
      ]
    },
    shifts: {
      id: "shifts",
      name: "shifts",
      type: "base",
      schema: [
        { name: "station", type: "text", required: true },
        { name: "day", type: "date", required: true },
        { name: "worker", type: "relation", options: { collectionId: "users" } }
      ]
    }
  }, null, 2)
};

// Create all dirs + files
for (const [file, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log("✅ Project files created. Now run:");
console.log("npm install");
console.log("npm run dev");
