import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ParsedMessage {
  date: Date
  senderNumber: string
  senderName?: string | undefined
  messageText: string
}

interface ExtractedPropertyData {
  propertyType?: string
  transactionType?: string
  areaNumber?: number
  neighborhoodNumber?: number
  area?: number
  floorNumber?: number
  installmentAmount?: number
  totalPrice?: number
  yearsPaid?: number
  yearsRemaining?: number
  features?: string[]
  finishing?: string
  contactNumber?: string
  description?: string
}

export class WhatsAppParser {
  private static propertyTypeKeywords = {
    'شقه': 'apartment',
    'شقة': 'apartment', 
    'قطعه ارض': 'land',
    'قطعة ارض': 'land',
    'ارض': 'land',
    'أرض': 'land',
    'بيت': 'house',
    'فيلا': 'villa',
    'مخزن': 'warehouse',
    'مكتب': 'office',
    'محل': 'shop',
    'تجاري': 'commercial'
  }

  private static transactionTypeKeywords = {
    'للبيع': 'for_sale',
    'بيع': 'for_sale',
    'موجود': 'for_sale',
    'موجوده': 'for_sale',
    'للايجار': 'for_rent',
    'للإيجار': 'for_rent',
    'ايجار': 'for_rent',
    'إيجار': 'for_rent',
    'مطلوب': 'wanted',
    'تم البيع': 'sold',
    'تم الايجار': 'rented'
  }

  private static finishingKeywords = [
    'تشطيب سوبر لوكس',
    'سوبر لوكس',
    'لوكس',
    'نص تشطيب',
    'متشطبه',
    'متشطب',
    'على الطوب',
    'عظم'
  ]

  private static featureKeywords = [
    'متقفله حديد',
    'متقفلة حديد',
    'ناصيه',
    'ناصية',
    'واجهه بحري',
    'واجهة بحري',
    'واجهه بحريه',
    'بحري',
    'أمامي',
    'امامي',
    'خلفي',
    'داخلي',
    'على السرفيس',
    'بجوار الخدمات',
    'قريب من الخدمات',
    'توكيل',
    'ملف كامل',
    'عقد اخضر',
    'رخصه',
    'رخصة',
    'خالصه',
    'خالصة',
    'مفروش',
    'مفروشة'
  ]

  static parseWhatsAppFile(filePath: string): ParsedMessage[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const messages: ParsedMessage[] = []

    let currentMessage: Partial<ParsedMessage> | null = null

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // Match message pattern: [date, time] sender: message
      const messageMatch = trimmedLine.match(/^\[(\d{2}\/\d{2}\/\d{4}),\s*(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))\]\s*([^:]+):\s*(.*)$/)
      
      if (messageMatch) {
        // Save previous message if exists
        if (currentMessage && currentMessage.date && currentMessage.senderNumber && currentMessage.messageText) {
          messages.push(currentMessage as ParsedMessage)
        }

        const [, dateStr, timeStr, sender, messageText] = messageMatch
        
        // Parse date and time
        const [day, month, year] = dateStr.split('/').map(Number)
        const dateTime = new Date(`${month}/${day}/${year} ${timeStr}`)
        
        // Extract phone number from sender
        const phoneMatch = sender.match(/\+20\s*(\d{2,3})\s*(\d{3})\s*(\d{4})/)
        let senderNumber = ''
        let senderName = sender.trim()
        
        if (phoneMatch) {
          senderNumber = `+20${phoneMatch[1]}${phoneMatch[2]}${phoneMatch[3]}`.replace(/\s/g, '')
          senderName = sender.trim().replace(/\+20\s*\d{2,3}\s*\d{3}\s*\d{4}/, '').trim() || undefined
        } else {
          // Check if sender has phone number at the end
          const phoneAtEndMatch = sender.match(/^(.+?)\s*\+?20?\s*(\d{10,11})$/)
          if (phoneAtEndMatch) {
            senderName = phoneAtEndMatch[1].trim()
            senderNumber = `+20${phoneAtEndMatch[2]}`
          } else {
            // Look for phone number in the message text
            const phoneInTextMatch = messageText.match(/0\d{10}/)
            if (phoneInTextMatch) {
              senderNumber = `+20${phoneInTextMatch[0].substring(1)}`
            }
          }
        }

        currentMessage = {
          date: dateTime,
          senderNumber,
          senderName,
          messageText: messageText.trim()
        }
      } else if (currentMessage) {
        // Continuation of previous message
        currentMessage.messageText += ' ' + trimmedLine
      }
    }

    // Add the last message
    if (currentMessage && currentMessage.date && currentMessage.senderNumber && currentMessage.messageText) {
      messages.push(currentMessage as ParsedMessage)
    }

    return messages
  }

  static extractPropertyData(messageText: string): ExtractedPropertyData | null {
    const text = messageText.toLowerCase()
    const originalText = messageText
    
    // Skip system messages
    if (text.includes('end-to-end encrypted') || 
        text.includes('created this group') || 
        text.includes('added you') ||
        text.includes('image omitted') ||
        text.includes('السعر') ||
        text.includes('بكام')) {
      return null
    }

    const data: ExtractedPropertyData = {}

    // Extract property type
    for (const [arabicType, englishType] of Object.entries(this.propertyTypeKeywords)) {
      if (text.includes(arabicType)) {
        data.propertyType = englishType
        break
      }
    }

    // Extract transaction type
    for (const [arabicTrans, englishTrans] of Object.entries(this.transactionTypeKeywords)) {
      if (text.includes(arabicTrans)) {
        data.transactionType = englishTrans
        break
      }
    }

    // Extract area number (الحي/حى)
    const areaMatches = originalText.match(/(?:الحي|حي|الحى|حى)\s*(\d+)/i)
    if (areaMatches) {
      data.areaNumber = parseInt(areaMatches[1])
    }

    // Extract neighborhood number (مجاوره/مجاورة)
    const neighborhoodMatches = originalText.match(/(?:مجاوره|مجاورة|المجاوره|المجاورة|مج)\s*(\d+)/i)
    if (neighborhoodMatches) {
      data.neighborhoodNumber = parseInt(neighborhoodMatches[1])
    }

    // Extract area in square meters
    const areaMatches2 = originalText.match(/(?:مساحه|مساحة)\s*(\d+)\s*(?:م|متر)/i)
    if (areaMatches2) {
      data.area = parseInt(areaMatches2[1])
    }

    // Extract floor number
    const floorMatches = originalText.match(/(?:دور|الدور)\s*(\d+|ارضي|أرضي|اول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر)/i)
    if (floorMatches) {
      const floorText = floorMatches[1]
      const floorNumbers: { [key: string]: number } = {
        'ارضي': 0, 'أرضي': 0, 'اول': 1, 'ثاني': 2, 'ثالث': 3,
        'رابع': 4, 'خامس': 5, 'سادس': 6, 'سابع': 7, 'ثامن': 8,
        'تاسع': 9, 'عاشر': 10
      }
      data.floorNumber = floorNumbers[floorText] ?? parseInt(floorText)
    }

    // Extract installment amount
    const installmentMatches = originalText.match(/(?:قسط|قسطها)\s*(\d+)\s*(?:ثابت)?/i)
    if (installmentMatches) {
      data.installmentAmount = parseInt(installmentMatches[1])
    }

    // Extract total price
    const priceMatches = originalText.match(/(?:سعر|مطلوب)\s*(\d+(?:\.\d+)?)\s*(?:مليون|الف|جنيه|جم)/i)
    if (priceMatches) {
      let price = parseFloat(priceMatches[1])
      const unit = originalText.match(/(?:مليون|الف)/i)?.[0]
      if (unit === 'مليون') price *= 1000000
      else if (unit === 'الف') price *= 1000
      data.totalPrice = price
    }

    // Extract years paid
    const yearsPaidMatches = originalText.match(/(?:دافع|مدفوع)\s*(\d+)\s*(?:سن|عام)/i)
    if (yearsPaidMatches) {
      data.yearsPaid = parseInt(yearsPaidMatches[1])
    }

    // Extract years remaining
    const yearsRemainingMatches = originalText.match(/(?:باقي|متبقي)\s*(\d+)\s*(?:سن|عام)/i)
    if (yearsRemainingMatches) {
      data.yearsRemaining = parseInt(yearsRemainingMatches[1])
    }

    // Extract finishing
    for (const finishing of this.finishingKeywords) {
      if (text.includes(finishing)) {
        data.finishing = finishing
        break
      }
    }

    // Extract features
    data.features = []
    for (const feature of this.featureKeywords) {
      if (text.includes(feature)) {
        data.features.push(feature)
      }
    }

    // Extract contact number
    const contactMatches = originalText.match(/0\d{10}/g)
    if (contactMatches) {
      data.contactNumber = contactMatches[0]
    }

    data.description = originalText

    // Only return data if we found at least a property type or transaction type
    if (data.propertyType || data.transactionType) {
      return data
    }

    return null
  }

  static async processAllChatFiles(): Promise<void> {
    const chatDir = path.join(process.cwd(), 'whatsapp_chat_exports')
    const files = fs.readdirSync(chatDir).filter(file => file.endsWith('.txt'))

    console.log(`Found ${files.length} chat files to process`)

    for (const file of files) {
      console.log(`Processing ${file}...`)
      const filePath = path.join(chatDir, file)
      const messages = this.parseWhatsAppFile(filePath)
      
      console.log(`Found ${messages.length} messages in ${file}`)

      for (const message of messages) {
        try {
          // Save the raw message
          const savedMessage = await prisma.whatsAppMessage.create({
            data: {
              messageDate: message.date,
              senderNumber: message.senderNumber,
              senderName: message.senderName,
              messageText: message.messageText,
              processed: false
            }
          })

          // Extract property data
          const propertyData = this.extractPropertyData(message.messageText)
          
          if (propertyData) {
            // Update message with extracted data
            await prisma.whatsAppMessage.update({
              where: { id: savedMessage.id },
              data: {
                processed: true,
                extractedData: propertyData as any
              }
            })

            // Create or find user
            let user = await prisma.user.findUnique({
              where: { mobileNumber: message.senderNumber },
              include: { agent: true }
            })

            if (!user && message.senderNumber) {
              user = await prisma.user.create({
                data: {
                  mobileNumber: message.senderNumber,
                  fullName: message.senderName,
                  role: 'agent',
                  passwordHash: 'temp_hash_' + Date.now() // Temporary password
                },
                include: { agent: true }
              })

              // Create agent profile
              await prisma.agent.create({
                data: {
                  userId: user.id
                }
              })
              
              // Refetch user with agent
              user = await prisma.user.findUnique({
                where: { id: user.id },
                include: { agent: true }
              })
            }

            // Create property if transaction type is for_sale or for_rent
            if (propertyData.transactionType === 'for_sale' || propertyData.transactionType === 'for_rent') {
              const property = await prisma.property.create({
                data: {
                  title: `${propertyData.propertyType || 'property'} ${propertyData.areaNumber ? `في الحي ${propertyData.areaNumber}` : ''}`,
                  description: propertyData.description,
                  type: propertyData.propertyType as any || 'other',
                  transactionType: propertyData.transactionType as any,
                  areaNumber: propertyData.areaNumber,
                  neighborhoodNumber: propertyData.neighborhoodNumber,
                  area: propertyData.area,
                  floorNumber: propertyData.floorNumber,
                  installmentAmount: propertyData.installmentAmount,
                  totalPrice: propertyData.totalPrice,
                  yearsPaid: propertyData.yearsPaid,
                  yearsRemaining: propertyData.yearsRemaining,
                  finishing: propertyData.finishing,
                  contactNumber: propertyData.contactNumber,
                  datePosted: message.date,
                  ownerId: user?.id || 'temp_owner',
                  agentId: user?.agent?.id
                }
              })

              // Link message to property
              await prisma.whatsAppMessage.update({
                where: { id: savedMessage.id },
                data: {
                  propertyId: property.id,
                  userId: user?.id
                }
              })

              console.log(`Created property: ${property.title}`)
            }

          }
        } catch (error) {
          console.error(`Error processing message: ${error}`)
        }
      }
    }

    console.log('Finished processing all chat files')
  }

  static async initializeStaticData(): Promise<void> {
    console.log('Initializing static data...')

    // Create areas (1-70 for العاشر من رمضان)
    for (let i = 1; i <= 70; i++) {
      try {
        await prisma.area.upsert({
          where: { number: i },
          update: {},
          create: {
            number: i,
            nameAr: `الحي ${i}`,
            nameEn: `Area ${i}`,
            city: 'العاشر من رمضان'
          }
        })
      } catch (error) {
        // Area might already exist
      }
    }

    // Create common features
    const features = [
      { nameAr: 'متقفله حديد', nameEn: 'Iron Fence', category: 'security' },
      { nameAr: 'ناصية', nameEn: 'Corner', category: 'location' },
      { nameAr: 'واجهة بحري', nameEn: 'North Facing', category: 'direction' },
      { nameAr: 'أمامي', nameEn: 'Front Facing', category: 'direction' },
      { nameAr: 'بجوار الخدمات', nameEn: 'Near Services', category: 'location' },
      { nameAr: 'توكيل', nameEn: 'Authorized', category: 'legal' },
      { nameAr: 'عقد أخضر', nameEn: 'Green Contract', category: 'legal' },
      { nameAr: 'ملف كامل', nameEn: 'Complete File', category: 'legal' },
      { nameAr: 'مفروش', nameEn: 'Furnished', category: 'condition' }
    ]

    for (const feature of features) {
      try {
        await prisma.feature.upsert({
          where: { nameAr_nameEn: { nameAr: feature.nameAr, nameEn: feature.nameEn } },
          update: {},
          create: feature
        })
      } catch (error) {
        // Try with just nameAr if the compound unique doesn't exist
        try {
          await prisma.feature.create({
            data: feature
          })
        } catch (error2) {
          // Feature might already exist
          console.log(`Feature ${feature.nameAr} might already exist`)
        }
      }
    }

    console.log('Static data initialized')
  }
}
