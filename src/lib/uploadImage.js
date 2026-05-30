import { supabase } from './supabase'
import { generateBlurDataUrl } from './generateBlurData'

const BUCKET = 'menu-images'

/**
 * Upload image to Supabase Storage and optionally generate blur_data.
 * @param {File} file
 * @param {string} folder - e.g. 'uploads' | 'hero'
 */
export async function uploadImage(file, folder = 'uploads') {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const [uploadResult, blurData] = await Promise.all([
    supabase.storage.from(BUCKET).upload(filePath, file, {
      cacheControl: '31536000',
      upsert: false,
    }),
    generateBlurDataUrl(file),
  ])

  if (uploadResult.error) {
    return { error: uploadResult.error, publicUrl: null, blurData: null }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  return { error: null, publicUrl, blurData }
}
