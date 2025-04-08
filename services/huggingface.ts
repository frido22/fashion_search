import { HfInference } from '@huggingface/inference'
import { StyleResponse } from './openai'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function generateStyleImage(recommendations: StyleResponse): Promise<Buffer> {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HuggingFace API key is not configured')
  }

  if (!recommendations.style?.description) {
    throw new Error('Style description is required for image generation')
  }

  const prompt = `Generate a fashion style image based on: ${recommendations.style.description}`
  
  try {
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: prompt,
      parameters: {
        negative_prompt: 'low quality, blurry, distorted',
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    })

    if (!response) {
      throw new Error('No response from HuggingFace API')
    }

    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`HuggingFace API error: ${error.message}`)
    }
    throw new Error('An unexpected error occurred with HuggingFace API')
  }
} 