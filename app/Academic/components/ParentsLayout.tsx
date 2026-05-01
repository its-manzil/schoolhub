'use client'

import { ReactNode } from 'react'
import AcademicNavbar from './AcademicNavbar'
import './ParentsLayout.css'

interface ParentsLayoutProps {
  children: ReactNode
}

export default function ParentsLayout({ children }: ParentsLayoutProps) {
  return (
    <div className="parents-layout">
      <AcademicNavbar />
      <main className="parents-layout__main">
        {children}
      </main>
    </div>
  )
}
