'use client'

import React from 'react'

type Props = {
    size?: number | string
    className?: string
    animated?: boolean
    variant?: 'color' | 'monochrome' | 'dark'
    color?: string
}

export const AnalyticsIcon = ({
    size = 32,
    className = "",
    animated = true,
    variant = 'color',
    color: customColor
}: Props) => {
    // Brand Colors
    const primaryColor = variant === 'monochrome' ? 'currentColor' : (customColor || '#0059FF')
    const secondaryColor = variant === 'monochrome' ? 'currentColor' : (variant === 'dark' ? '#00D0FF' : '#00A3FF')

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="lineGradient" x1="40" y1="110" x2="160" y2="90" gradientUnits="userSpaceOnUse">
                    <stop stopColor={primaryColor} />
                    <stop offset="1" stopColor={secondaryColor} />
                </linearGradient>

                <radialGradient id="nodeGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(12)">
                    <stop stopColor="white" stopOpacity="0.8" />
                    <stop offset="1" stopColor={primaryColor} />
                </radialGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <style>
                    {`
            @keyframes pulse {
              0% { transform: scale(0.8); opacity: 0.6; }
              50% { transform: scale(1.3); opacity: 0.2; }
              100% { transform: scale(0.8); opacity: 0.6; }
            }
            .pulse-ring {
              transform-origin: center;
              animation: ${animated ? 'pulse 2.5s ease-in-out infinite' : 'none'};
            }
            .delay-1 { animation-delay: 0.2s; }
            .delay-2 { animation-delay: 0.4s; }
            .delay-3 { animation-delay: 0.6s; }
          `}
                </style>
            </defs>

            {/* Pulsing Rings (Background Glows) */}
            <g className="pulse-rings">
                <circle cx="40" cy="110" r="18" fill={primaryColor} fillOpacity="0.15" className="pulse-ring" />
                <circle cx="80" cy="70" r="16" fill={primaryColor} fillOpacity="0.15" className="pulse-ring delay-1" />
                <circle cx="120" cy="120" r="14" fill={primaryColor} fillOpacity="0.15" className="pulse-ring delay-2" />
                <circle cx="160" cy="90" r="12" fill={primaryColor} fillOpacity="0.15" className="pulse-ring delay-3" />
            </g>

            {/* Connecting Lines */}
            <path
                d="M40 110 L80 70 L120 120 L160 90"
                stroke="url(#lineGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: variant !== 'monochrome' ? 'url(#glow)' : 'none' }}
            />

            {/* Nodes (Circles) */}
            <g>
                {/* Node 1 */}
                <circle cx="40" cy="110" r="12" fill={primaryColor} />
                <circle cx="40" cy="110" r="5" fill="white" fillOpacity="0.4" />

                {/* Node 2 */}
                <circle cx="80" cy="70" r="10" fill={primaryColor} />
                <circle cx="80" cy="70" r="4" fill="white" fillOpacity="0.4" />

                {/* Node 3 */}
                <circle cx="120" cy="120" r="9" fill={primaryColor} />
                <circle cx="120" cy="120" r="3.5" fill="white" fillOpacity="0.4" />

                {/* Node 4 */}
                <circle cx="160" cy="90" r="8" fill={primaryColor} />
                <circle cx="160" cy="90" r="3" fill="white" fillOpacity="0.4" />
            </g>
        </svg>
    )
}
