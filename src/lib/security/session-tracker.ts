import { UAParser } from 'ua-parser-js'
import { createAdminClient } from '@/lib/supabase/admin'

interface SessionData {
    userId: string
    sessionToken: string
    ipAddress?: string
    userAgent?: string
    deviceName?: string // New: Optional custom device name from client
    isCurrent?: boolean
}

interface DeviceInfo {
    browser: string
    browserVersion: string
    os: string
    osVersion: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
    deviceVendor?: string
    deviceModel?: string
}

/**
 * Parse user agent string to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
    const parser = new UAParser(userAgent)
    const browser = parser.getBrowser()
    const os = parser.getOS()
    const device = parser.getDevice()

    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'
    if (device.type === 'mobile') deviceType = 'mobile'
    else if (device.type === 'tablet') deviceType = 'tablet'

    return {
        browser: browser.name || 'Unknown Browser',
        browserVersion: browser.version || '',
        os: os.name || 'Unknown OS',
        osVersion: os.version || '',
        deviceType,
        deviceVendor: device.vendor,
        deviceModel: device.model
    }
}

/**
 * Get approximate location from IP address using free API
 */
export async function getLocationFromIP(ip: string): Promise<string> {
    // Skip for localhost/private IPs - provide descriptive dev message
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        // Professional engineering label for dev mode
        return 'Current Network (Local)'
    }

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,regionName,country,isp`, {
            signal: AbortSignal.timeout(3000)
        })

        if (!response.ok) return 'Location (Unavailable)'

        const data = await response.json()
        if (data.status === 'success' && data.city && data.country) {
            return `${data.city}, ${data.country}`
        }
        return data.country || data.message || 'Remote Device'
    } catch {
        return 'Remote Device'
    }
}

/**
 * Simple hash function for session tokens
 */
async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create or update a session record for the user
 */
export async function trackSession(data: SessionData): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[TRACKER DEBUG] trackSession called for userId:', data.userId)
    }
    try {
        const supabase = await createAdminClient()
        if (process.env.NODE_ENV !== 'production') {
            console.log('[TRACKER DEBUG] Admin client created')
        }

        const deviceInfo = data.userAgent ? parseUserAgent(data.userAgent) : null

        // Improve hardware detection: use deviceName hint if provided, otherwise fallback to parsed model
        const modelName = data.deviceName || deviceInfo?.deviceModel || null
        const vendorName = deviceInfo?.deviceVendor || null

        const location = data.ipAddress ? await getLocationFromIP(data.ipAddress) : null

        // Hash the session token for security (we just need to identify it)
        const hashedToken = await hashToken(data.sessionToken)
        if (process.env.NODE_ENV !== 'production') {
            console.log('[TRACKER DEBUG] Token hashed (length):', hashedToken.length)
        }

        // Upsert session record
        const { data: upsertResult, error } = await supabase
            .from('user_sessions')
            .upsert({
                session_token: hashedToken,
                user_id: data.userId,
                ip_address: data.ipAddress || null,
                location: location,
                user_agent: data.userAgent || null,
                browser: deviceInfo?.browser || null,
                os: deviceInfo?.os || null,
                device_type: deviceInfo?.deviceType || 'desktop',
                device_info: deviceInfo ? JSON.stringify({
                    ...deviceInfo,
                    deviceName: data.deviceName // Store the hint for reference
                }) : null,
                is_current: data.isCurrent ?? false,
                last_active: new Date().toISOString(),
                login_success: true
            }, {
                onConflict: 'session_token'
            })
            .select()

        if (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('[TRACKER DEBUG] DB Upsert error:', error)
            }
        } else {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[TRACKER DEBUG] DB Upsert success, record ID:', upsertResult?.[0]?.id)
            }
        }
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[TRACKER DEBUG] General tracking error:', error)
        }
    }
}

/**
 * Log a failed login attempt
 */
export async function logFailedLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
        const supabase = await createAdminClient()

        const deviceInfo = userAgent ? parseUserAgent(userAgent) : null
        const location = ipAddress ? await getLocationFromIP(ipAddress) : null

        const { error } = await supabase
            .from('user_sessions')
            .insert({
                session_token: `failed-${Date.now()}-${Math.random()}`,
                user_id: userId,
                ip_address: ipAddress || null,
                location: location,
                user_agent: userAgent || null,
                browser: deviceInfo?.browser || null,
                os: deviceInfo?.os || null,
                device_type: deviceInfo?.deviceType || 'desktop',
                login_success: false,
                is_current: false
            })

        if (error) {
            console.error('Failed to log failed login:', error)
        }
    } catch (error) {
        console.error('Failed login logging error:', error)
    }
}

/**
 * Update last active timestamp for a session
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
    try {
        const supabase = await createAdminClient()
        const hashedToken = await hashToken(sessionToken)

        const { error } = await supabase
            .from('user_sessions')
            .update({ last_active: new Date().toISOString() })
            .eq('session_token', hashedToken)

        if (error) {
            console.error('Failed to update session activity:', error)
        }
    } catch (error) {
        console.error('Session activity update error:', error)
    }
}
