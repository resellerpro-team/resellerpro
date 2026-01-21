
import { useState, useEffect } from 'react'

export function useScrollTrigger(thresholdPercentage: number = 0.5) {
    const [isTriggered, setIsTriggered] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            // Check if we've scrolled past the threshold percentage
            // Using a small buffer for very short pages to ensure it triggers if logical
            if (scrollTop + windowHeight >= fullHeight * thresholdPercentage) {
                setIsTriggered(true)
            } else {
                setIsTriggered(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        // Check initially
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [thresholdPercentage])

    return isTriggered
}
