
import { useState, useEffect } from 'react'

export function useScrollToBottom(threshold: number = 20) {
    const [isBottom, setIsBottom] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            // Check if we've scrolled near the bottom (within threshold px)
            if (scrollTop + windowHeight >= fullHeight - threshold) {
                setIsBottom(true)
            } else {
                setIsBottom(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        // Check initially in case the page is short or already scrolled
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [threshold])

    return isBottom
}
