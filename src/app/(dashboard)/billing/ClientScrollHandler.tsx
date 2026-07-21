'use client'

import { useEffect } from 'react'

export function ClientScrollHandler() {
  useEffect(() => {
    // Check if we have a hash in the URL (e.g., #pricing)
    if (window.location.hash) {
      // Small delay to ensure the page has fully rendered
      const timeoutId = setTimeout(() => {
        const hash = window.location.hash.substring(1) // Remove the #
        const element = document.getElementById(hash)
       
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100) // 100ms delay ensures DOM is loaded

      return () => clearTimeout(timeoutId)
    }
  }, [])

  return null
}
