'use client'

import { useState, useEffect } from 'react'
import { CollapsibleSection } from './CollapsibleSection'

// Global state to manage which sections should be open
const sectionStates = new Map<string, boolean>()
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(listener => listener())
}

// Export this function to be used by other components
export function openSection(key: string) {
  sectionStates.set(key, true)
  notifyListeners()
}

export function CollapsibleSectionWrapper({
  title,
  icon,
  defaultOpen = false,
  sectionKey,
  children,
}: {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  sectionKey: string
  children: React.ReactNode
}) {
  const [forceOpen, setForceOpen] = useState(sectionStates.get(sectionKey) || defaultOpen)

  useEffect(() => {
    const listener = () => {
      const shouldOpen = sectionStates.get(sectionKey)
      if (shouldOpen) {
        setForceOpen(true)
        // Reset after opening to allow manual closing
        setTimeout(() => {
          sectionStates.set(sectionKey, false)
          setForceOpen(false)
        }, 100)
      }
    }

    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [sectionKey])

  return (
    <CollapsibleSection
      title={title}
      icon={icon}
      defaultOpen={defaultOpen}
      forceOpen={forceOpen}
    >
      {children}
    </CollapsibleSection>
  )
}