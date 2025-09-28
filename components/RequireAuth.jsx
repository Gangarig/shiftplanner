'use client'
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
}