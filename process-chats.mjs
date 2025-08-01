import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Run the WhatsApp processing
async function main() {
  try {
    console.log('🚀 Starting WhatsApp chat processing...')
    
    const chatDir = path.join(process.cwd(), 'whatsapp_chat_exports')
    if (!fs.existsSync(chatDir)) {
      console.error('❌ WhatsApp chat exports folder not found!')
      process.exit(1)
    }

    // Initialize static data first
    console.log('📋 Initializing static data...')
    
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
        await prisma.feature.create({
          data: feature
        })
      } catch (error) {
        // Feature might already exist
      }
    }

    console.log('✅ Static data initialized')

    // Process chat files
    const files = fs.readdirSync(chatDir).filter(file => file.endsWith('.txt'))
    console.log(`📄 Found ${files.length} chat files to process`)

    let totalMessages = 0
    let processedMessages = 0
    let propertiesCreated = 0

    for (const file of files) {
      console.log(`📖 Processing ${file}...`)
      const filePath = path.join(chatDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // Match message pattern: [date, time] sender: message
        const messageMatch = trimmedLine.match(/^\[(\d{2}\/\d{2}\/\d{4}),\s*(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))\]\s*([^:]+):\s*(.*)$/)
        
        if (messageMatch) {
          totalMessages++
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
          } else {
            // Look for phone number in the message text
            const phoneInTextMatch = messageText.match(/0\d{10}/)
            if (phoneInTextMatch) {
              senderNumber = `+20${phoneInTextMatch[0].substring(1)}`
            }
          }

          if (!senderNumber) continue

          // Extract property data
          const text = messageText.toLowerCase()
          
          // Skip system messages
          if (text.includes('end-to-end encrypted') || 
              text.includes('created this group') || 
              text.includes('added you') ||
              text.includes('image omitted')) {
            continue
          }

          // Check if this is a property message
          const hasPropertyKeywords = text.includes('للبيع') || text.includes('للايجار') || 
                                     text.includes('موجود') || text.includes('شقه') || 
                                     text.includes('ارض') || text.includes('بيت') ||
                                     text.includes('مطلوب')

          if (!hasPropertyKeywords) continue

          processedMessages++

          try {
            // Save the message
            const savedMessage = await prisma.whatsAppMessage.create({
              data: {
                messageDate: dateTime,
                senderNumber,
                senderName,
                messageText,
                processed: true
              }
            })

            // Extract property data
            const propertyData = {
              propertyType: 'other',
              transactionType: 'for_sale'
            }

            // Determine property type
            if (text.includes('شقه') || text.includes('شقة')) {
              propertyData.propertyType = 'apartment'
            } else if (text.includes('قطعه ارض') || text.includes('ارض')) {
              propertyData.propertyType = 'land'
            } else if (text.includes('بيت')) {
              propertyData.propertyType = 'house'
            } else if (text.includes('مخزن')) {
              propertyData.propertyType = 'warehouse'
            }

            // Determine transaction type
            if (text.includes('للايجار')) {
              propertyData.transactionType = 'for_rent'
            } else if (text.includes('مطلوب')) {
              propertyData.transactionType = 'wanted'
            }

            // Extract area number
            let areaNumber = null
            const areaMatch = messageText.match(/(?:الحي|حي|الحى|حى)\s*(\d+)/i)
            if (areaMatch) {
              areaNumber = parseInt(areaMatch[1])
            }

            // Extract area in square meters
            let area = null
            const areaMatch2 = messageText.match(/(?:مساحه|مساحة)\s*(\d+)\s*(?:م|متر)/i)
            if (areaMatch2) {
              area = parseInt(areaMatch2[1])
            }

            // Extract installment
            let installmentAmount = null
            const installmentMatch = messageText.match(/(?:قسط|قسطها)\s*(\d+)/i)
            if (installmentMatch) {
              installmentAmount = parseInt(installmentMatch[1])
            }

            // Create or find user
            let user = await prisma.user.findUnique({
              where: { mobileNumber: senderNumber }
            })

            if (!user) {
              user = await prisma.user.create({
                data: {
                  mobileNumber: senderNumber,
                  fullName: senderName,
                  role: 'agent',
                  passwordHash: 'temp_hash_' + Date.now()
                }
              })

              // Create agent profile
              await prisma.agent.create({
                data: {
                  userId: user.id
                }
              })
            }

            // Create property if it's for sale or rent
            if (propertyData.transactionType === 'for_sale' || propertyData.transactionType === 'for_rent') {
              await prisma.property.create({
                data: {
                  title: `${propertyData.propertyType} ${areaNumber ? `في الحي ${areaNumber}` : ''}`,
                  description: messageText,
                  type: propertyData.propertyType,
                  transactionType: propertyData.transactionType,
                  areaNumber,
                  area,
                  installmentAmount,
                  datePosted: dateTime,
                  ownerId: user.id
                }
              })
              propertiesCreated++
            }

            // Update message with property link
            await prisma.whatsAppMessage.update({
              where: { id: savedMessage.id },
              data: {
                userId: user.id,
                extractedData: {
                  propertyType: propertyData.propertyType,
                  transactionType: propertyData.transactionType,
                  areaNumber,
                  area,
                  installmentAmount
                }
              }
            })

          } catch (error) {
            console.error(`Error processing message: ${error}`)
          }
        }
      }
    }

    console.log('✅ Processing completed successfully!')
    console.log(`📊 Statistics:`)
    console.log(`Total messages: ${totalMessages}`)
    console.log(`Processed messages: ${processedMessages}`)
    console.log(`Properties created: ${propertiesCreated}`)

    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { mobileNumber: '01002778090' }
    })

    if (!adminExists) {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('ZeroCall20!@H', 12)
      
      await prisma.user.create({
        data: {
          mobileNumber: '01002778090',
          email: 'ahmedgfathy@gmail.com',
          fullName: 'Ahmed Fathy',
          role: 'admin',
          passwordHash: hashedPassword
        }
      })
      console.log('✅ Admin user created')
    }

  } catch (error) {
    console.error('❌ Error processing chats:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
