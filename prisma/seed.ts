import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('ZeroCall20!@H', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { mobileNumber: '01002778090' },
    update: {
      email: 'ahmedgfathy@gmail.com',
      fullName: 'Ahmed Gfathy',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
    },
    create: {
      mobileNumber: '01002778090',
      email: 'ahmedgfathy@gmail.com',
      fullName: 'Ahmed Gfathy',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
    },
  })

  console.log('✅ Admin user created:', adminUser.mobileNumber)

  // Create some sample data
  const sampleAgent = await prisma.user.upsert({
    where: { mobileNumber: '01234567890' },
    update: {},
    create: {
      mobileNumber: '01234567890',
      email: 'agent@contaboo.local',
      fullName: 'Sample Agent',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'agent',
      isActive: true,
      agent: {
        create: {
          licenseNumber: 'LIC-001',
          specialization: 'Residential Properties',
          commissionRate: 0.03,
        }
      }
    },
    include: {
      agent: true,
    }
  })

  console.log('✅ Sample agent created:', sampleAgent.mobileNumber)

  // Create sample properties
  if (sampleAgent.agent) {
    const sampleProperty = await prisma.property.create({
      data: {
        title: 'Beautiful Villa in New Cairo',
        description: 'A stunning 4-bedroom villa with a garden and swimming pool.',
        price: 2500000,
        location: 'New Cairo',
        address: '123 Villa Street, New Cairo',
        bedrooms: 4,
        bathrooms: 3,
        area: 350,
        propertyType: 'villa',
        status: 'available',
        features: JSON.stringify(['Swimming Pool', 'Garden', 'Parking', 'Security']),
        agentId: sampleAgent.id,
      },
    })

    console.log('✅ Sample property created:', sampleProperty.title)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
