"use server"

import { redirect } from "next/navigation"
import {
  registerUser,
  loginUser,
  createSession,
  logout as logoutSession,
} from "@/lib/auth"
import { sql } from "@/lib/db"

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  // Check if using existing dorm or creating new one
  const dormId = formData.get("dorm_id") as string
  const dormName = formData.get("dorm_name") as string
  const electricityRate = formData.get("electricity_rate") as string
  
  let finalDormId = dormId
  
  // If creating new dorm
  if (!dormId && dormName && electricityRate) {
    const rate = parseFloat(electricityRate)
    
    if (isNaN(rate) || rate <= 0) {
      return { error: "อัตราค่าไฟฟ้าต้องมากกว่า 0" }
    }
    
    // Create new dorm
    const newDorm = await sql`
      INSERT INTO dorms (name, rate)
      VALUES (${dormName}, ${rate})
      RETURNING id
    `
    
    finalDormId = newDorm[0].id
  }
  
  if (!email || !password || !finalDormId) {
    return { error: "ข้อมูลทุกช่องจำเป็นต้องกรอก" }
  }
  
  if (email.length < 3) {
    return { error: "อีเมลต้องมีอย่างน้อย 3 ตัวอักษร" }
  }
  
  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }
  }
  
  const result = await registerUser(email, password, finalDormId)
  
  if (!result.success) {
    return { error: result.error }
  }
  
  await createSession(result.userId!)
  redirect("/dashboard")
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "All fields are required" }
  }

  const result = await loginUser(email, password)

  if (!result.success) {
    return { error: result.error }
  }

  await createSession(result.userId!)
  redirect("/dashboard")
}

export async function logout() {
  await logoutSession()
  redirect("/")
}

export async function getDorms() {
  const dorms = await sql`SELECT id, name FROM dorms ORDER BY name`
  return dorms
}
