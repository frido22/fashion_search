import dotenv from 'dotenv'
import fs from 'fs'
import OpenAI from 'openai'
import path from 'path'

// Load environment variables explicitly
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is not set")
}

const client = new OpenAI({
  apiKey
})

// Define clothing categories for diverse recommendations
const CLOTHING_CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories"
]

interface Style {
  title: string
  description: string
  tags: string[]
}

interface Item {
  description: string
  category: string
}

interface StyleResponse {
  style: Style
  items: Item[]
}

interface UserAttributes {
  gender_presentation?: string
  apparent_age_range?: string
  body_type?: string
  height_impression?: string
  skin_tone?: string
  style_suggestions?: string[]
  colors_to_complement?: string[]
  avoid_styles?: string[]
}

interface UserInput {
  additional_info: string
  budget: string
  profile_photo_path?: string
  aesthetic_photo_paths?: string[]
}

export async function analyzeUserPhotos(userPhotoPaths: string[]): Promise<UserAttributes> {
  if (!userPhotoPaths || userPhotoPaths.length === 0) {
    return {}
  }

  // Prepare messages for the API call
  const messages: any[] = [
    {
      role: "system",
      content: `You are a fashion expert and personal stylist. Analyze the provided photos of a person to extract 
      physical attributes relevant for fashion recommendations. Be respectful, inclusive, and focus only on attributes 
      that would help with clothing recommendations. Provide your analysis in JSON format with the following fields:
      - gender_presentation: The apparent gender presentation (masculine, feminine, androgynous, etc.)
      - apparent_age_range: Estimated age range (e.g., "18-25", "25-35", "35-50", etc.)
      - body_type: Body shape and proportions (e.g., rectangle, hourglass, athletic, pear, apple, etc.)
      - height_impression: Impression of height (tall, average, petite)
      - skin_tone: General skin tone category (very fair, fair, medium, olive, tan, deep, etc.)
      - style_suggestions: 3-5 specific style suggestions based on the person's physical attributes
      - colors_to_complement: 3-5 color recommendations that would complement their skin tone and features
      - avoid_styles: 1-2 styles or cuts that might be less flattering for their body type
      `
    }
  ]

  // Add user photos
  for (const photoPath of userPhotoPaths) {
    const imageBuffer = fs.readFileSync(photoPath)
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
      ]
    })
  }

  // Add final instruction
  messages.push({
    role: "user",
    content: "Please analyze these photos and provide the attributes in JSON format as specified."
  })

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 800,
      temperature: 0.5
    })

    const responseText = response.choices[0].message.content?.trim() || ""

    // Try to extract JSON from the response
    try {
      // Find JSON object in the response
      const startIdx = responseText.indexOf('{')
      const endIdx = responseText.lastIndexOf('}') + 1

      if (startIdx >= 0 && endIdx > startIdx) {
        const jsonStr = responseText.substring(startIdx, endIdx)
        const attributes = JSON.parse(jsonStr)
        console.log(`Successfully extracted user attributes: ${Object.keys(attributes)}`)
        return attributes
      } else {
        console.log("Could not find JSON in user photo analysis response")
        return {}
      }
    } catch (e) {
      console.log(`Error parsing JSON from user photo analysis: ${e}`)
      console.log(`Response text: ${responseText.substring(0, 200)}...`)
      return {}
    }
  } catch (e) {
    console.log(`Error analyzing user photos: ${e}`)
    return {}
  }
}

export async function generateSearchQuery(userInput: UserInput): Promise<StyleResponse> {
  // Extract user inputs
  const additionalInfo = userInput.additional_info || ""
  const budget = userInput.budget || "medium"
  const profilePhotoPath = userInput.profile_photo_path
  const aestheticPhotoPaths = userInput.aesthetic_photo_paths || []

  // First, analyze user photo if provided
  let userAttributes: UserAttributes = {}
  if (profilePhotoPath) {
    console.log("Analyzing profile photo...")
    userAttributes = await analyzeUserPhotos([profilePhotoPath])
  }

  // Prepare the prompt for OpenAI
  let prompt = `As a fashion expert, analyze the provided information and generate fashion recommendations.
  
Please return your response in the following JSON format EXACTLY:
{
    "style": { 
        "title": "Style category name",
        "description": "Description of the style",
        "tags": ["tag1", "tag2", ...],
    },
    "items": [
        {
            "description": "Detailed description of the recommended item",
            "category": "Category (must be one of: Tops, Bottoms, Dresses, Outerwear, Accessories)"
        },
        ...
    ]
}

Make sure to:
1. Include 4-6 items
2. Use the exact category names: Tops, Bottoms, Dresses, Outerwear, or Accessories
3. Make descriptions specific and detailed
4. Consider the provided budget level and style preferences
5. Return ONLY the JSON, no additional text

User preferences:
`

  if (additionalInfo) {
    prompt += `Style preferences: ${additionalInfo}\n`
  }

  if (budget) {
    prompt += `Budget level: ${budget}\n`
  }

  if (Object.keys(userAttributes).length > 0) {
    prompt += `User attributes: ${JSON.stringify(userAttributes, null, 2)}\n`
  }

  if (aestheticPhotoPaths.length > 0) {
    prompt += `Number of inspiration photos provided: ${aestheticPhotoPaths.length}\n`
  }

  // Prepare the messages for the API call
  const messages: any[] = [
    { role: "system", content: "You are a fashion expert who provides specific and detailed clothing recommendations." },
    { role: "user", content: prompt }
  ]

  // Add user photo if provided
  if (profilePhotoPath) {
    messages.push({
      role: "user",
      content: "I'm providing a photo of myself. Please analyze my body type, proportions, and overall appearance to recommend clothing that would be flattering for my physique."
    })

    const imageBuffer = fs.readFileSync(profilePhotoPath)
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
      ]
    })
  }

  // Add aesthetic photos if provided
  if (aestheticPhotoPaths.length > 0) {
    messages.push({
      role: "user",
      content: `I'm also providing ${aestheticPhotoPaths.length} photo(s) of fashion styles I like. Please analyze these images carefully and consider their colors, patterns, textures, silhouettes, and overall aesthetic when generating your search queries.`
    })

    // Add each aesthetic photo as a separate message
    for (const photoPath of aestheticPhotoPaths) {
      const imageBuffer = fs.readFileSync(photoPath)
      const base64Image = Buffer.from(imageBuffer).toString('base64')

      messages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      })
    }
  }

  // Call OpenAI API
  try {
    // Use gpt-4o for vision capabilities when images are provided
    // Use gpt-4o-mini when no images are provided (more cost-effective)
    const hasImages = (profilePhotoPath !== undefined) || (aestheticPhotoPaths.length > 0)
    const model = hasImages ? "gpt-4o" : "gpt-4o-mini"

    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const responseText = response.choices[0].message.content?.trim() || ""

    // Try to parse the JSON response
    try {
      // Find JSON object in the response
      const startIdx = responseText.indexOf('{')
      const endIdx = responseText.lastIndexOf('}') + 1

      if (startIdx >= 0 && endIdx > startIdx) {
        const jsonStr = responseText.substring(startIdx, endIdx)
        const recommendations = JSON.parse(jsonStr)

        // Validate the structure
        if ("style" in recommendations && "items" in recommendations) {
          if ("title" in recommendations.style && "description" in recommendations.style && "tags" in recommendations.style) {
            return recommendations as StyleResponse
          } else {
            console.log("Invalid style format in response, here's the response: ", jsonStr)
          }
        }

        // If we get here, the response wasn't in the correct format
        return {
          style: {
            title: "Casual",
            description: "Casual style",
            tags: ["casual", "comfortable", "everyday"]
          },
          items: [
            {
              description: `Fashion item matching ${additionalInfo}`,
              category: "Tops"
            },
            {
              description: `Fashion item for ${budget} budget`,
              category: "Bottoms"
            }
          ]
        }
      }
    } catch (e) {
      // Fallback if JSON parsing fails
      return {
        style: {
          title: "Casual",
          description: "Casual style",
          tags: ["casual", "comfortable", "everyday"]
        },
        items: [
          {
            description: `Fashion item matching ${additionalInfo}`,
            category: "Tops"
          },
          {
            description: `Fashion item for ${budget} budget`,
            category: "Bottoms"
          }
        ]
      }
    }
  } catch (e) {
    console.log(`Error calling OpenAI API: ${e}`)
    // Fallback to a basic response
    return {
      style: {
        title: "Casual",
        description: "Casual style",
        tags: ["casual", "comfortable", "everyday"]
      },
      items: [
        {
          description: `Fashion item matching ${additionalInfo}`,
          category: "Tops"
        },
        {
          description: `Fashion item for ${budget} budget`,
          category: "Bottoms"
        }
      ]
    }
  }

  // This should never be reached, but TypeScript needs it
  return {
    style: {
      title: "Casual",
      description: "Casual style",
      tags: ["casual", "comfortable", "everyday"]
    },
    items: [
      {
        description: `Fashion item matching ${additionalInfo}`,
        category: "Tops"
      },
      {
        description: `Fashion item for ${budget} budget`,
        category: "Bottoms"
      }
    ]
  }
} 