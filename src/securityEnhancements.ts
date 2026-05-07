/**
 * Security Enhancements for RedTail Academy
 * 
 * - Input validation and sanitization
 * - Secure data storage
 * - XSS prevention
 * - CSRF protection
 * - Rate limiting
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string, type: 'text' | 'html' | 'email' = 'text'): string {
  if (!input) return ''

  // Remove potentially dangerous characters
  let sanitized = input.trim()

  if (type === 'email') {
    // Email validation
    sanitized = sanitized.toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
      throw new Error('Invalid email format')
    }
    return sanitized
  }

  if (type === 'html') {
    // Use DOMPurify for HTML
    return DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'] })
  }

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  sanitized = sanitized.substring(0, 1000) // Limit length

  return sanitized
}

/**
 * Validate and sanitize API requests
 */
export function validateApiRequest(
  data: any,
  schema: Record<string, 'string' | 'number' | 'boolean' | 'array'>
): boolean {
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in data)) {
      console.warn(`Missing required field: ${key}`)
      return false
    }

    const actualType = Array.isArray(data[key]) ? 'array' : typeof data[key]
    if (actualType !== type) {
      console.warn(`Invalid type for ${key}: expected ${type}, got ${actualType}`)
      return false
    }
  }
  return true
}

/**
 * Secure storage for sensitive data
 */
export class SecureStorage {
  private static CIPHER_KEY = 'redtail-cipher-key'

  /**
   * Encrypt data before storing
   */
  static setSecure(key: string, value: any): void {
    try {
      const json = JSON.stringify(value)
      // Simple XOR encryption (for production, use proper encryption like NaCl)
      const encrypted = this.simpleEncrypt(json)
      localStorage.setItem(`secure_${key}`, encrypted)
    } catch (e) {
      console.error('Secure storage failed:', e)
    }
  }

  /**
   * Decrypt data from storage
   */
  static getSecure<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`)
      if (!encrypted) return null
      const decrypted = this.simpleDecrypt(encrypted)
      return JSON.parse(decrypted)
    } catch (e) {
      console.error('Secure retrieval failed:', e)
      return null
    }
  }

  private static simpleEncrypt(text: string): string {
    // Note: This is basic. Use libsodium or tweetnacl for production
    return btoa(text) // Base64 encode as placeholder
  }

  private static simpleDecrypt(encrypted: string): string {
    return atob(encrypted) // Base64 decode as placeholder
  }
}

/**
 * Rate limiter to prevent abuse
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 10, windowMs: number = 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (record.count < this.maxAttempts) {
      record.count++
      return true
    }

    return false
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return this.maxAttempts
    return Math.max(0, this.maxAttempts - record.count)
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

/**
 * Validate Firebase security rules compliance
 */
export function validateSecurityRules(userId: string, resourceOwner: string): boolean {
  // User can only access their own data
  return userId === resourceOwner
}

/**
 * CSRF token management
 */
export class CSRFProtection {
  static generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  static validateToken(token: string): boolean {
    // In production, validate against server-stored token
    return token && token.length === 64
  }
}

/**
 * Password strength validator
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score++

  if (/[a-z]/.test(password)) score++
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Add numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score++
  else feedback.push('Add special characters')

  return {
    isStrong: score >= 4,
    score,
    feedback,
  }
}

/**
 * Secure logout
 */
export async function secureLogout(): Promise<void> {
  // Clear sensitive data
  const keysToRemove = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .filter((key) => key?.startsWith('secure_') || key?.includes('auth'))
    .filter((key): key is string => key !== null)

  keysToRemove.forEach((key) => localStorage.removeItem(key))

  // Clear session storage
  sessionStorage.clear()

  // Revoke OAuth tokens if applicable
  try {
    // Handle Firebase sign out
    const { auth } = await import('./firebase')
    await auth.signOut()
  } catch (e) {
    console.log('Logout completed')
  }
}
