'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SchoolAdminNavbar from '../SchoolAdmin/Components/SchoolAdminNavbar'
import BillingNavbar from './components/BillingNavbar'
import './billingMain.css'

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)

    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userData)
        if (user.role !== 'schooladmin' && user.role !== 'billing') {
          router.push('/login')
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (!isClient || isLoading) {
    return (
      <div className="billing-loading-wrapper">
        <div className="billing-loading-spinner"></div>
        <div className="billing-loading-text">Loading Billing Dashboard...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <SchoolAdminNavbar />
      <div className="billing-layout">
        <BillingNavbar />
        <main className="billing-main-content">
          {children}
        </main>
      </div>
    </>
  )
}