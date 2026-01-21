
import { useState, useEffect } from 'react'
import { useScrollTrigger } from './useScrollTrigger'

const STORAGE_KEY = 'resellerpro_popup_closes'
const POPUP_REAPPEAR_DELAY = 5000 // 5 seconds
const MAX_CLOSES = 3

export function usePopupController() {
    // Trigger at 50% scroll
    const isTriggered = useScrollTrigger(0.5)

    const [isVisible, setIsVisible] = useState(false)
    const [closeCount, setCloseCount] = useState(0)
    const [isCooldown, setIsCooldown] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    // Load state from sessionStorage on mount
    useEffect(() => {
        const savedCount = sessionStorage.getItem(STORAGE_KEY)
        if (savedCount) {
            setCloseCount(parseInt(savedCount, 10))
        }
        setHasLoaded(true)
    }, [])

    // Visibility Logic
    useEffect(() => {
        if (!hasLoaded) return

        // If we have reached max closes, never show
        if (closeCount >= MAX_CLOSES) {
            setIsVisible(false)
            return
        }

        // If triggers are met and we are not in cooldown
        if (isTriggered && !isCooldown && !isVisible) {
            // Check if we should show it (meaning we are not currently hiding it due to a recent close)
            // Actually, `isVisible` check handles "don't re-trigger if already open"
            // But we need to make sure we don't auto-show if we JUST closed it (handled by cooldown)

            // There is an edge case: 
            // User scrolls > 50% -> Shows.
            // User scrolls up (< 50%) -> Should it hide? 
            // Requirement: "Popup should appear when user scrolls...". Usually modal popups stay until closed.
            // My `useScrollTrigger` returns false if they scroll up. 
            // If I want it to STAY open until closed, I shouldn't depend on `isTriggered` being true to keep it open, only to OPEN it.

            // We only want to setVisible(true) if triggers allow.
            // We do NOT want to setVisible(false) if !isTriggered (unless we want it to be transient, but prompt implies explicit close).

            setIsVisible(true)
        }
    }, [isTriggered, isCooldown, hasLoaded, closeCount])
    // removed `isVisible` from dependency to avoid loop? 
    // No, `if (!isVisible)` is the guard. 
    // But wait, if `isVisible` is true, effect runs, condition fails. Safe.
    // If `isVisible` becomes false (closed), `useEffect` runs.
    // `isTriggered` is true. `isCooldown` is true (set by close). -> Do nothing. 
    // 5s later: `isCooldown` becomes false.
    // `useEffect` runs. `isTriggered` is true. `!isVisible`. `closeCount < 3`. -> `setIsVisible(true)`.
    // This achieves "wait 5s, re-enable".

    const closePopup = () => {
        setIsVisible(false)

        const newCount = closeCount + 1
        setCloseCount(newCount)
        sessionStorage.setItem(STORAGE_KEY, newCount.toString())

        if (newCount < MAX_CLOSES) {
            setIsCooldown(true)
            setTimeout(() => {
                setIsCooldown(false)
            }, POPUP_REAPPEAR_DELAY)
        }
    }

    return { isVisible, closePopup }
}
