import { createClient } from "@/lib/supabase/client"
import bcrypt from "bcryptjs"

export interface AdminUser {
  id: number
  username: string
  field_office_id: number
  is_main_admin: boolean
  field_office: {
    code: string
    name: string
  }
}

// Production version with proper bcrypt hashing
export async function authenticateAdminProduction(
  fieldOfficeCode: string,
  username: string,
  password: string,
): Promise<AdminUser | null> {
  const supabase = createClient()

  try {
    // Get field office
    const { data: fieldOffice, error: officeError } = await supabase
      .from("field_offices")
      .select("id, code, name")
      .eq("code", fieldOfficeCode)
      .single()

    if (officeError || !fieldOffice) {
      console.error("Field office not found:", officeError)
      return null
    }

    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("field_office_id", fieldOffice.id)
      .single()

    if (userError || !adminUser) {
      console.error("Admin user not found:", userError)
      return null
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
    if (!isValidPassword) {
      console.error("Invalid password")
      return null
    }

    return {
      id: adminUser.id,
      username: adminUser.username,
      field_office_id: adminUser.field_office_id,
      is_main_admin: adminUser.is_main_admin,
      field_office: {
        code: fieldOffice.code,
        name: fieldOffice.name,
      },
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

// Function to hash passwords for production setup
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Function to create admin users with hashed passwords
export async function createAdminUser(
  username: string,
  password: string,
  fieldOfficeId: number,
  isMainAdmin = false,
): Promise<boolean> {
  const supabase = createClient()

  try {
    const hashedPassword = await hashPassword(password)

    const { error } = await supabase.from("admin_users").insert({
      username,
      password_hash: hashedPassword,
      field_office_id: fieldOfficeId,
      is_main_admin: isMainAdmin,
    })

    return !error
  } catch (error) {
    console.error("Error creating admin user:", error)
    return false
  }
}
