#!/usr/bin/env node

import { WhatsAppParser } from '../src/lib/whatsapp-parser.js'

async function main() {
  try {
    console.log('🚀 Starting WhatsApp chat processing...')
    
    // Initialize static data first
    await WhatsAppParser.initializeStaticData()
    
    // Process all chat files
    await WhatsAppParser.processAllChatFiles()
    
    console.log('✅ Processing completed successfully!')
    
    // Show some statistics
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const messageCount = await prisma.whatsAppMessage.count()
    const processedCount = await prisma.whatsAppMessage.count({ where: { processed: true } })
    const propertyCount = await prisma.property.count()
    const agentCount = await prisma.agent.count()
    
    console.log('\n📊 Statistics:')
    console.log(`Total messages: ${messageCount}`)
    console.log(`Processed messages: ${processedCount}`)
    console.log(`Properties created: ${propertyCount}`)
    console.log(`Agents created: ${agentCount}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error processing chats:', error)
    process.exit(1)
  }
}

main()
