import { supabase } from "@/lib/supabase/client"

export async function uploadFile(file: File, bucket: string, path: string): Promise<string> {
  try {
    // Sanitize the file name
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const timestamp = Date.now()
    const fileName = `${timestamp}_${sanitizedFileName}`
    const filePath = `${path}/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error("File upload error:", error)
    throw error
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error("File delete error:", error)
    throw error
  }
}
