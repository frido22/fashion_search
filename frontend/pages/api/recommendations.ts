import { Fields, Files, IncomingForm } from 'formidable'
import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'
import os from 'os'
import path from 'path'
import { generateStyleImage } from '../../services/huggingface'
import { generateSearchQuery } from '../../services/openai'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface RecommendationsResponse {
  style: {
    description: string
    image: string
  }
  items: Array<{
    name: string
    description: string
    searchQuery: string
  }>
  colors: string[]
  budget: {
    range: string
    tips: string[]
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    })

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })
    
    const additionalInfo = (fields.additional_info as string[])?.[0] || ''
    const budget = (fields.budget as string[])?.[0] || 'medium'
    
    const tempDir = path.join(os.tmpdir(), 'fashion_search')
    const profilePhotosDir = path.join(tempDir, 'profile_photos')
    const aestheticPhotosDir = path.join(tempDir, 'aesthetic_photos')
    
    fs.mkdirSync(tempDir, { recursive: true })
    fs.mkdirSync(profilePhotosDir, { recursive: true })
    fs.mkdirSync(aestheticPhotosDir, { recursive: true })
    
    let profilePhotoPath = null
    if (files.profile_photo?.[0]) {
      const photo = files.profile_photo[0]
      profilePhotoPath = path.join(profilePhotosDir, `profile_photo_${photo.originalFilename}`)
      fs.copyFileSync(photo.filepath, profilePhotoPath)
    }
    
    const aestheticPhotoPaths = []
    const inspirationFiles = Object.entries(files).filter(([key]) => key.startsWith('inspiration_images['))
    
    for (const [_, photo] of inspirationFiles) {
      if (photo?.[0]) {
        const filePath = path.join(aestheticPhotosDir, `inspiration_${photo[0].originalFilename}`)
        fs.copyFileSync(photo[0].filepath, filePath)
        aestheticPhotoPaths.push(filePath)
      }
    }
    
    const userInput = {
      additional_info: additionalInfo,
      budget,
      profile_photo_path: profilePhotoPath,
      aesthetic_photo_paths: aestheticPhotoPaths
    }
    
    const recommendations = await generateSearchQuery(userInput) as RecommendationsResponse
    const styleImage = await generateStyleImage(recommendations)
    const base64Image = Buffer.from(styleImage).toString('base64')
    
    recommendations.style.image = `data:image/png;base64,${base64Image}`
    
    // Cleanup temporary files
    if (profilePhotoPath) {
      fs.unlinkSync(profilePhotoPath)
    }
    for (const path of aestheticPhotoPaths) {
      fs.unlinkSync(path)
    }
    
    return res.status(200).json(recommendations)
  } catch (error) {
    console.error('Error in recommendations:', error)
    return res.status(500).json({ success: false, error: String(error) })
  }
} 