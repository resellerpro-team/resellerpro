export interface ParsedCustomerData {
  name: string | null
  phone: string | null
  email: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  whatsapp: string | null
  confidence: number
  missingFields: string[]
}

/**
 * Extract customer data from WhatsApp message
 */
export function parseWhatsAppMessage(message: string): ParsedCustomerData {
  const normalized = message.trim()
  
  // Extract city, state, pincode FIRST
  const city = extractCity(normalized)
  const state = extractState(normalized)
  const pincode = extractPincode(normalized)
  
  const result: ParsedCustomerData = {
    name: extractName(normalized),
    phone: extractPhone(normalized),
    email: extractEmail(normalized),
    addressLine1: null,
    addressLine2: null,
    city: city,
    state: state,
    pincode: pincode,
    whatsapp: null,
    confidence: 0,
    missingFields: [],
  }

  // Extract address AFTER city and state are known
  const addressData = extractAddress(normalized, city, state, pincode)
  result.addressLine1 = addressData.line1
  result.addressLine2 = addressData.line2

  // WhatsApp same as phone
  result.whatsapp = result.phone

  // Calculate confidence
  const analysis = analyzeResults(result)
  result.confidence = analysis.confidence
  result.missingFields = analysis.missingFields

  return result
}

function extractName(text: string): string | null {
  // Remove header/decorator lines
  const cleaned = text.replace(/^[*\-=#+\s]*(?:format|customer|details?|information|address).*$/gim, '')
  
  // Pattern: Name field with :- separator
  const fieldPattern = /(?:^|\n)\s*(?:name|naam|नाम|പേര്|customer\s*name)\s*[:=-]+\s*([A-Za-z\u0900-\u097F\u0D00-\u0D7F\s]{2,50}?)(?=\s*\n|$)/i
  const fieldMatch = cleaned.match(fieldPattern)
  
  if (fieldMatch) {
    const name = fieldMatch[1].trim()
    
    // Reject field labels and junk
    const invalidKeywords = /^(full|house|phone|pin|address|city|state|district|landmark|post|po|contact|mob|email|format)/i
    if (!invalidKeywords.test(name) && name.length >= 2) {
      const words = name.split(/\s+/)
      if (words.length >= 1 && words.length <= 5) {
        return toTitleCase(name)
      }
    }
  }

  return null
}

function extractPhone(text: string): string | null {
  const cleanText = text
    .replace(/^[*\-=#+]+$/gm, '')
    .replace(/\b(flat|house|plot|room|floor)\s*no?\.?\s*[:=-]?\s*\d+/gi, '')
  
  const patterns = [
    /(?:phone|ph|mobile|mob|contact|whatsapp|cell)(?:\s+no)?[\s:=-]+(\+?91)?[-.\s]*([6-9]\d{9})/i,
    /\b([6-9]\d{9})\b/,
  ]

  for (const pattern of patterns) {
    const match = cleanText.match(pattern)
    if (match) {
      const digitMatch = match[0].match(/([6-9]\d{9})/)
      if (digitMatch) {
        const digits = digitMatch[1]
        if (digits.length === 10 && /^[6-9]/.test(digits)) {
          return digits
        }
      }
    }
  }

  return null
}

function extractEmail(text: string): string | null {
  const patterns = [
    /(?:email|e-mail|mail)[\s:=-]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].toLowerCase()
    }
  }

  return null
}

function extractPincode(text: string): string | null {
  const patterns = [
    /(?:pin|pincode|zip|postal)(?:\s+code)?[\s:=-]+([1-9]\d{5})\b/i,
    /\b([1-9]\d{5})\b/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && /^[1-9]\d{5}$/.test(match[1])) {
      return match[1]
    }
  }

  return null
}

function extractAddress(
  text: string,
  extractedCity: string | null,
  extractedState: string | null,
  extractedPincode: string | null
): {
  line1: string | null
  line2: string | null
} {
  let line1: string | null = null
  let line2: string | null = null

  // Build comprehensive list of cities to remove (including common Kerala districts)
  const citiesToRemove: string[] = []
  if (extractedCity) {
    citiesToRemove.push(extractedCity)
  }
  // Add common districts that appear in addresses
  citiesToRemove.push('kozhikode', 'calicut', 'malappuram', 'kannur', 'thrissur', 'ernakulam', 'kochi')

  // Helper: Clean address by removing city/state/pincode
  const cleanAddressPart = (addr: string): string => {
    let cleaned = addr.trim()
    
    // Remove pincode first
    if (extractedPincode) {
      cleaned = cleaned.replace(new RegExp(`\\b${extractedPincode}\\b`, 'g'), '')
    }
    
    // Remove state
    if (extractedState) {
      cleaned = cleaned.replace(new RegExp(`\\b${extractedState}\\b`, 'gi'), '')
    }
    
    // Remove all cities (from end to start to preserve order)
    for (const city of citiesToRemove) {
      // Use word boundary and case insensitive
      const cityRegex = new RegExp(`\\b${city}\\b`, 'gi')
      cleaned = cleaned.replace(cityRegex, '')
    }
    
    // Clean up extra spaces, commas, hyphens
    cleaned = cleaned
      .replace(/\s*,\s*,\s*/g, ', ')  // Multiple commas
      .replace(/\s+/g, ' ')            // Multiple spaces
      .replace(/^[,\-\s]+/, '')        // Leading junk
      .replace(/[,\-\s]+$/, '')        // Trailing junk
      .trim()
    
    return cleaned
  }

  // Validate address line
  const isValidAddressLine = (line: string): boolean => {
    if (!line || line.length < 3) return false
    if (/^[^a-zA-Z0-9]+$/.test(line)) return false // Only special chars
    if (/^[*\-=#+\s]+$/.test(line)) return false   // Decorator line
    if (/^(name|phone|pin|city|state|district|email|format)/i.test(line)) return false
    return true
  }

  // Pattern 1: Full Address field (PRIMARY)
  const fullAddressPattern = /(?:full\s*address|address)\s*[:=-]+\s*([\s\S]*?)(?=\n\s*(?:house\s*name|house|landmark|city|district|state|pin|phone|email|$))/i

  const fullAddressMatch = text.match(fullAddressPattern)
  
  if (fullAddressMatch) {
    const rawAddress = fullAddressMatch[1].trim()
    const cleaned = cleanAddressPart(rawAddress)
    
    if (isValidAddressLine(cleaned)) {
      line1 = cleaned
    }
  }

  // Pattern 2: House name field (ONLY if no full address found)
  if (!line1) {
    const houseNamePattern = /(?:house\s*name|house)\s*[:=-]+\s*(.+?)(?=\s*\n|$)/i
    const houseNameMatch = text.match(houseNamePattern)
    
    if (houseNameMatch) {
      const houseName = houseNameMatch[1].trim()
      if (isValidAddressLine(houseName)) {
        line1 = houseName
      }
    }
  }

  // Pattern 3: Post Office (add to line1 if not already there)
  const poPattern = /(?:post\s*office|p\.?o\.?)\s*[:=-]?\s*[:\(]?\s*([a-zA-Z\s]+?)(?:\)|,|\s*\n|$)/i
  const poMatch = text.match(poPattern)
  
  if (poMatch && line1) {
    const po = poMatch[1].trim()
    // Check if PO is not already in line1
    if (po.length > 2 && !line1.toLowerCase().includes(po.toLowerCase())) {
      line1 += ` ${po} (PO)`
    }
  }

  // Pattern 4: Landmark field (ALWAYS use as line2)
  const landmarkPattern = /(?:landmark|near|area)\s*[:=-]+\s*(.+?)(?=\s*\n|$)/i
  const landmarkMatch = text.match(landmarkPattern)
  
  if (landmarkMatch) {
    const landmark = landmarkMatch[1].trim()
    if (isValidAddressLine(landmark)) {
      line2 = `Near ${landmark}`
    }
  }

  // Fallback: Extract address-like content if still empty
  if (!line1) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    for (const line of lines) {
      if (/^[a-z\s]+\s*[:=-]/i.test(line)) continue
      
      const addressKeywords = /\b(house|flat|building|apartment|road|street|lane|nagar|colony|plot|sector|tower)\b/i
      
      if (addressKeywords.test(line) && isValidAddressLine(line)) {
        line1 = cleanAddressPart(line)
        if (isValidAddressLine(line1)) {
          break
        }
      }
    }
  }

  return {
    line1,
    line2,
  }
}

function extractCity(text: string): string | null {
  // Priority 1: City field
  const cityPattern = /(?:^|\n)\s*(?:city)\s*[:=-]+\s*(.+?)(?=\s*\n|$)/i
  const cityMatch = text.match(cityPattern)
  
  if (cityMatch) {
    const city = cityMatch[1].trim()
    const cleaned = city.replace(/\b(city)\b/gi, '').trim()
    if (cleaned.length > 2 && /[a-zA-Z]/.test(cleaned)) {
      return toTitleCase(cleaned)
    }
  }

  // Priority 2: District field (fallback)
  const districtPattern = /(?:^|\n)\s*(?:district)\s*[:=-]+\s*(.+?)(?=\s*\n|$)/i
  const districtMatch = text.match(districtPattern)
  
  if (districtMatch) {
    const district = districtMatch[1].trim()
    const cleaned = district.replace(/\b(district)\b/gi, '').trim()
    if (cleaned.length > 2 && /[a-zA-Z]/.test(cleaned)) {
      // Only use district as city if no city field was found
      return toTitleCase(cleaned)
    }
  }

  // Priority 3: Pattern matching from text
  const cities = [
    'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune',
    'thiruvananthapuram', 'trivandrum', 'kochi', 'cochin', 'kozhikode', 'calicut',
    'thrissur', 'kollam', 'palakkad', 'kannur', 'kottayam', 'alappuzha',
    'malappuram', 'manjeri', 'tirur', 'ponnani', 'nilambur', 'perinthalmanna',
    'thiruvambady', 'tanur', 'kottakkal', 'valanchery', 'kondotty',
    'aluva', 'angamaly', 'guruvayur', 'thodupuzha', 'muvattupuzha',
  ]

  const normalized = text.toLowerCase()
  const sortedCities = [...cities].sort((a, b) => b.length - a.length)
  
  for (const city of sortedCities) {
    const pattern = new RegExp(`\\b${city}\\b`, 'i')
    if (pattern.test(normalized)) {
      return toTitleCase(city)
    }
  }

  return null
}

function extractState(text: string): string | null {
  // Direct field match
  const statePattern = /(?:^|\n)\s*(?:state)\s*[:=-]+\s*(.+?)(?=\s*\n|$)/i
  const match = text.match(statePattern)
  
  if (match) {
    const state = match[1].trim()
    const cleaned = state.replace(/\bstate\b/gi, '').trim()
    if (cleaned.length > 2) {
      return toTitleCase(cleaned)
    }
  }

  // State list fallback
  const states: Record<string, string> = {
    'kerala': 'Kerala',
    'maharashtra': 'Maharashtra',
    'karnataka': 'Karnataka',
    'tamil nadu': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'delhi': 'Delhi',
    'gujarat': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'uttar pradesh': 'Uttar Pradesh',
    'west bengal': 'West Bengal',
  }

  const normalized = text.toLowerCase()
  const sortedStates = Object.entries(states).sort((a, b) => b[0].length - a[0].length)
  
  for (const [key, value] of sortedStates) {
    if (normalized.includes(key)) {
      return value
    }
  }

  return null
}

function toTitleCase(text: string): string {
  const specialCases: Record<string, string> = {
    'po': 'PO',
    'p.o': 'P.O',
    'nagar': 'Nagar',
  }
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase()
      if (specialCases[lower]) {
        return specialCases[lower]
      }
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function analyzeResults(data: ParsedCustomerData): {
  confidence: number
  missingFields: string[]
} {
  let score = 0
  const missing: string[] = []

  if (data.name) score += 25
  else missing.push('Name')

  if (data.phone) score += 30
  else missing.push('Phone')

  if (data.addressLine1) score += 20
  else missing.push('Address')

  if (data.pincode) score += 15
  else missing.push('Pincode')

  if (data.city) score += 5
  if (data.state) score += 5

  return {
    confidence: Math.min(100, Math.max(0, score)),
    missingFields: missing,
  }
}

export function validateCustomerData(data: ParsedCustomerData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.name || data.name.length < 2) {
    errors.push('Invalid or missing name')
  }

  if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
    errors.push('Invalid or missing phone number')
  }

  if (!data.addressLine1 || data.addressLine1.length < 3) {
    errors.push('Invalid or missing address')
  }

  if (!data.pincode || !/^[1-9]\d{5}$/.test(data.pincode)) {
    errors.push('Invalid or missing pincode')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}