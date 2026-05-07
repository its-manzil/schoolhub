'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BillingMainPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUserRole(user.role)
        const isSchoolAdmin = user.role === 'schooladmin'
        const basePath = isSchoolAdmin ? '/SchoolAdmin/billing' : '/billing'
        router.push(`${basePath}/dashboard`)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error reading user role:', error)
      router.push('/login')
    }
  }, [router])

  return (
    <div className="billing-loading-wrapper">
      <div className="billing-loading-spinner"></div>
      <p className="billing-loading-text">Redirecting to dashboard...</p>
    </div>
  )
}