import { supabase } from "@/lib/supabase/client"
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
  // Using the pre-configured supabase client

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

    // Type assertion to ensure fieldOffice has the expected structure
    const typedFieldOffice = fieldOffice as { id: number; code: string; name: string }

    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("field_office_id", typedFieldOffice.id)
      .single()

    if (userError || !adminUser) {
      console.error("Admin user not found:", userError)
      return null
    }

    // Type assertion to ensure adminUser has the expected structure
    const typedAdminUser = adminUser as { 
      id: number; 
      username: string; 
      field_office_id: number; 
      is_main_admin: boolean; 
      password_hash: string 
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, typedAdminUser.password_hash)
    if (!isValidPassword) {
      console.error("Invalid password")
      return null
    }

    return {
      id: typedAdminUser.id,
      username: typedAdminUser.username,
      field_office_id: typedAdminUser.field_office_id,
      is_main_admin: typedAdminUser.is_main_admin,
      field_office: {
        code: typedFieldOffice.code,
        name: typedFieldOffice.name,
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
  // Using the pre-configured supabase client

  try {
    const hashedPassword = await hashPassword(password)

    const { error } = await (supabase.from("admin_users") as any).insert({
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
