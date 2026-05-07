'use client'

import './ParentOverviewCards.css'

interface ParentStats {
  totalParents: number
  parentsWithChildren: number
  totalChildren: number
  multiChildFamilies: number
  classCoverage: number
}

interface ParentOverviewCardsProps {
  stats: ParentStats
}

export default function ParentOverviewCards({ stats }: ParentOverviewCardsProps) {
  const cards = [
    {
      label: 'Total Parents',
      value: stats.totalParents,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      colorClass: 'parent-overview__icon-wrapper--green'
    },
    {
      label: 'Parents with Children',
      value: stats.parentsWithChildren,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <circle cx="12" cy="8" r="2"/>
        </svg>
      ),
      colorClass: 'parent-overview__icon-wrapper--blue'
    },
    {
      label: 'Total Children',
      value: stats.totalChildren,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
        </svg>
      ),
      colorClass: 'parent-overview__icon-wrapper--purple'
    },
    {
      label: 'Multi-child Families',
      value: stats.multiChildFamilies,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <circle cx="19" cy="11" r="2"/>
          <path d="M23 21v-2a2 2 0 0 0-2-2h-2"/>
        </svg>
      ),
      colorClass: 'parent-overview__icon-wrapper--red'
    },
    {
      label: 'Class Coverage',
      value: `${stats.classCoverage}/15`,
      subValue: 'Classes',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
      ),
      colorClass: 'parent-overview__icon-wrapper--teal'
    }
  ]

  return (
    <div className="parent-overview">
      {cards.map((card, index) => (
        <div key={index} className="parent-overview__card">
          <div className={`parent-overview__icon-wrapper ${card.colorClass}`}>
            {card.icon}
          </div>
          <div>
            <div className="parent-overview__value">{card.value}</div>
            <div className="parent-overview__label">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
