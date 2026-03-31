import { cookies } from "next/headers"
import { sql } from "./db"
import { randomBytes, pbkdf2Sync } from "crypto"

export interface User {
  id: string
  email: string
  dorm_id: string
  dorm_name?: string
  dorm_rate?: number
  created_at: Date
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, storedHash] = hashedPassword.split(":")
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return hash === storedHash
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `

  const cookieStore = await cookies()
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return null

  const sessions = await sql`
    SELECT s.user_id, s.expires_at, u.email, u.dorm_id, d.name as dorm_name, d.rate as dorm_rate
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN dorms d ON u.dorm_id = d.id
    WHERE s.token = ${token}
  `

  if (sessions.length === 0) return null

  const session = sessions[0]
  if (new Date(session.expires_at) < new Date()) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
    return null
  }

  return {
    id: session.user_id,
    email: session.email,
    dorm_id: session.dorm_id,
    dorm_name: session.dorm_name,
    dorm_rate: parseFloat(session.dorm_rate) || 0,
    created_at: new Date(),
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
    cookieStore.delete("session_token")
  }
}

export async function registerUser(
  email: string,
  password: string,
  dormId: string
): Promise<{ success: boolean; error?: string; userId?: string }> {

  const existing = await sql`
    SELECT id FROM users WHERE email = ${email}
  `

  if (existing.length > 0) {
    return { success: false, error: "Email already exists" }
  }

  const passwordHash = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password, dorm_id)
    VALUES (${email}, ${passwordHash}, ${dormId})
    RETURNING id
  `

  return { success: true, userId: result[0].id }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; userId?: string }> {

  const users = await sql`
    SELECT id, password FROM users WHERE email = ${email}
  `

  if (users.length === 0) {
    return { success: false, error: "Invalid email or password" }
  }

  const user = users[0]
  const valid = await verifyPassword(password, user.password)

  if (!valid) {
    return { success: false, error: "Invalid email or password" }
  }

  return { success: true, userId: user.id }
}