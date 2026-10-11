import crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt: number;
  expiresAt: number;
}

// In-memory active sessions map (backed by token)
const sessions = new Map<string, Session>();

// Session duration: 24 hours
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// Rate limiting: max 5 failed attempts per IP/identifier within 15 minutes
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Hash password with a cryptographically secure random salt using scrypt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Verify password against stored hash and salt using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically random session token
 */
export function createSession(user: User): Session {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: Session = {
    token,
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  sessions.set(token, session);
  return session;
}

/**
 * Verify session token. Returns null if invalid or expired.
 */
export function verifySession(token: string): Session | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session;
}

/**
 * Revoke session on logout
 */
export function revokeSession(token: string): boolean {
  if (!token) return false;
  return sessions.delete(token);
}

/**
 * Check if identifier/IP is currently rate-limited
 */
export function checkRateLimit(key: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (now > entry.resetAt) {
    rateLimits.delete(key);
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.attempts += 1;
  }
}

/**
 * Reset failed attempts on successful authentication
 */
export function resetRateLimit(key: string): void {
  rateLimits.delete(key);
}
