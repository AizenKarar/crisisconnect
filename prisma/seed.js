const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (safe re-run)
  console.log('🧹 Cleaning existing data...')
  await prisma.areaAlert.deleteMany()
  await prisma.supplyRequest.deleteMany()
  await prisma.supply.deleteMany()
  await prisma.postComment.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.task.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.message.deleteMany()
  await prisma.incidentResponse.deleteMany()
  await prisma.missingPerson.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.emergencyContact.deleteMany()
  await prisma.shelter.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const adminPass = await bcrypt.hash('admin123', 10)
  const userPass = await bcrypt.hash('user123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crisisconnect.org' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@crisisconnect.org',
      password: adminPass,
      role: 'ADMIN',
      isVerified: true,
      karmaPoints: 500,
    },
  })

  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@crisisconnect.org' },
    update: {},
    create: {
      name: 'Marcus Rivera',
      email: 'volunteer@crisisconnect.org',
      password: userPass,
      role: 'VOLUNTEER',
      skills: 'Truck Driver,Heavy Lifting,Cooking',
      isVerified: true,
      karmaPoints: 180,
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@crisisconnect.org' },
    update: {},
    create: {
      name: 'Officer James Park',
      email: 'staff@crisisconnect.org',
      password: userPass,
      role: 'STAFF',
      isVerified: true,
      karmaPoints: 250,
    },
  })

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@crisisconnect.org' },
    update: {},
    create: {
      name: 'Anika Patel',
      email: 'citizen@crisisconnect.org',
      password: userPass,
      role: 'CITIZEN',
      karmaPoints: 45,
    },
  })

  // Create incidents
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        title: 'Major Building Fire - Downtown',
        description: 'A 5-story commercial building caught fire near Mirpur Road. Multiple floors engulfed. People may be trapped on upper floors. Fire department en route.',
        type: 'FIRE',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Mirpur Road, Dhaka 1205',
        reporterId: citizen.id,
      },
    }),
    prisma.incident.create({
      data: {
        title: 'Flash Flood in Low-Lying Area',
        description: 'Heavy monsoon rain caused severe flooding in the Demra area. Water level rising fast. Several families stranded on rooftops.',
        type: 'FLOOD',
        severity: 'HIGH',
        status: 'VERIFIED',
        latitude: 23.7261,
        longitude: 90.4968,
        address: 'Demra, Dhaka',
        reporterId: citizen.id,
      },
    }),
    prisma.incident.create({
      data: {
        title: 'Road Collapse After Earthquake Tremor',
        description: 'Minor earthquake tremor caused partial road collapse near Gulshan. No injuries reported yet but traffic severely disrupted.',
        type: 'EARTHQUAKE',
        severity: 'MEDIUM',
        status: 'VERIFIED',
        latitude: 23.7934,
        longitude: 90.4141,
        address: 'Gulshan 2, Dhaka',
        reporterId: volunteer.id,
      },
    }),
    prisma.incident.create({
      data: {
        title: 'Medical Emergency at Refugee Camp',
        description: 'Outbreak of waterborne illness at temporary shelter. Approximately 30 people showing symptoms. Urgent medical supplies needed.',
        type: 'MEDICAL',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        latitude: 23.7509,
        longitude: 90.3742,
        address: 'Mohammadpur, Dhaka',
        reporterId: staff.id,
      },
    }),
    prisma.incident.create({
      data: {
        title: 'Power Line Down - Storm Damage',
        description: 'Severe storm knocked down power lines on Dhanmondi Road. Area is dangerous. Live wires on the ground.',
        type: 'STORM',
        severity: 'HIGH',
        status: 'PENDING',
        latitude: 23.7465,
        longitude: 90.3762,
        address: 'Dhanmondi 27, Dhaka',
        reporterId: citizen.id,
      },
    }),
    prisma.incident.create({
      data: {
        title: 'Bridge Structural Damage',
        description: 'Cracks observed on the Buriganga Bridge support columns. Engineers requested for immediate assessment.',
        type: 'INFRASTRUCTURE',
        severity: 'HIGH',
        status: 'PENDING',
        latitude: 23.7104,
        longitude: 90.4074,
        address: 'Buriganga Bridge, Dhaka',
        isAnonymous: true,
      },
    }),
  ])

  // Create shelters
  const shelters = await Promise.all([
    prisma.shelter.create({
      data: {
        name: 'Central Relief Center',
        address: 'Motijheel, Dhaka 1000',
        latitude: 23.7339,
        longitude: 90.4190,
        maxCapacity: 500,
        occupied: 347,
        status: 'OPEN',
        phone: '+880-2-1234567',
        supplies: {
          create: [
            { name: 'Drinking Water', category: 'WATER', quantity: 2000, unit: 'liters', minLevel: 500 },
            { name: 'Food Packs', category: 'FOOD', quantity: 150, unit: 'packs', minLevel: 100 },
            { name: 'First Aid Kits', category: 'MEDICINE', quantity: 45, unit: 'kits', minLevel: 20 },
            { name: 'Blankets', category: 'CLOTHING', quantity: 200, unit: 'pieces', minLevel: 50 },
          ],
        },
      },
    }),
    prisma.shelter.create({
      data: {
        name: 'North Dhaka Emergency Shelter',
        address: 'Uttara Sector 7, Dhaka',
        latitude: 23.8759,
        longitude: 90.3795,
        maxCapacity: 300,
        occupied: 289,
        status: 'OPEN',
        phone: '+880-2-7654321',
        supplies: {
          create: [
            { name: 'Drinking Water', category: 'WATER', quantity: 400, unit: 'liters', minLevel: 500 },
            { name: 'Food Packs', category: 'FOOD', quantity: 80, unit: 'packs', minLevel: 100 },
            { name: 'Medicine', category: 'MEDICINE', quantity: 12, unit: 'boxes', minLevel: 15 },
            { name: 'Tents', category: 'EQUIPMENT', quantity: 25, unit: 'pieces', minLevel: 10 },
          ],
        },
      },
    }),
    prisma.shelter.create({
      data: {
        name: 'Riverside Aid Station',
        address: 'Sadarghat, Dhaka',
        latitude: 23.7088,
        longitude: 90.4069,
        maxCapacity: 150,
        occupied: 150,
        status: 'FULL',
        phone: '+880-2-9876543',
        supplies: {
          create: [
            { name: 'Drinking Water', category: 'WATER', quantity: 100, unit: 'liters', minLevel: 200 },
            { name: 'Food Packs', category: 'FOOD', quantity: 30, unit: 'packs', minLevel: 50 },
            { name: 'Antibiotics', category: 'MEDICINE', quantity: 5, unit: 'boxes', minLevel: 10 },
          ],
        },
      },
    }),
  ])

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      { action: 'INCIDENT_CREATED', details: 'New fire incident reported downtown', incidentId: incidents[0].id, userId: citizen.id },
      { action: 'STATUS_CHANGED', details: 'Status changed from PENDING to VERIFIED', incidentId: incidents[0].id, userId: staff.id },
      { action: 'STATUS_CHANGED', details: 'Status changed from VERIFIED to IN_PROGRESS', incidentId: incidents[0].id, userId: admin.id },
      { action: 'VOLUNTEER_ASSIGNED', details: 'Dr. Sarah Chen assigned to medical emergency', incidentId: incidents[3].id, userId: admin.id },
      { action: 'INCIDENT_CREATED', details: 'Flood reported in Demra', incidentId: incidents[1].id, userId: citizen.id },
      { action: 'STATUS_CHANGED', details: 'Status changed from PENDING to VERIFIED', incidentId: incidents[1].id, userId: staff.id },
    ],
  })

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { title: '🚨 SOS Alert', message: 'Critical fire reported near your area. Stay safe and avoid Mirpur Road.', type: 'SOS', userId: citizen.id },
      { title: '🆕 New Assignment', message: 'You have been assigned to the Medical Emergency at Mohammadpur.', type: 'ALERT', userId: staff.id },
      { title: '⚠️ Low Supplies', message: 'North Dhaka Shelter water supply is critically low.', type: 'RESUPPLY', userId: admin.id },
      { title: '✅ Incident Resolved', message: 'The power line incident in Dhanmondi has been resolved.', type: 'INFO', userId: staff.id },
    ],
  })

  // Create missing persons
  await prisma.missingPerson.createMany({
    data: [
      {
        name: 'Rahim Uddin',
        age: 12,
        gender: 'Male',
        description: 'Last seen wearing a blue school uniform. Has a small scar on his left cheek. Was walking home from school.',
        lastSeenPlace: 'Mirpur Section 10, Dhaka',
        lastSeenDate: new Date('2026-02-20'),
        contactPhone: '+880-1711-234567',
        contactName: 'Karim Uddin (Father)',
        status: 'MISSING',
        latitude: 23.8069,
        longitude: 90.3687,
        reporterId: citizen.id,
      },
      {
        name: 'Fatima Begum',
        age: 65,
        gender: 'Female',
        description: 'Elderly woman with grey hair. Wears glasses. Has mild dementia. Last seen in a white sari near the market area.',
        lastSeenPlace: 'Sadarghat, Old Dhaka',
        lastSeenDate: new Date('2026-02-18'),
        contactPhone: '+880-1911-987654',
        contactName: 'Nasreen Akhter (Daughter)',
        status: 'MISSING',
        latitude: 23.7088,
        longitude: 90.4069,
        reporterId: citizen.id,
      },
      {
        name: 'Sumon Das',
        age: 28,
        gender: 'Male',
        description: 'Missing since the flood in Demra area. Was helping neighbors evacuate. Medium build, short black hair.',
        lastSeenPlace: 'Demra, Dhaka',
        lastSeenDate: new Date('2026-02-15'),
        contactPhone: '+880-1812-456789',
        contactName: 'Rita Das (Wife)',
        status: 'MISSING',
        latitude: 23.7261,
        longitude: 90.4968,
        reporterId: volunteer.id,
      },
      {
        name: 'Ayesha Khatun',
        age: 8,
        gender: 'Female',
        description: 'Found safe at Central Relief Center after being separated from family during evacuation.',
        lastSeenPlace: 'Motijheel, Dhaka',
        lastSeenDate: new Date('2026-02-19'),
        contactPhone: '+880-1612-111222',
        contactName: 'Relief Center Staff',
        status: 'FOUND',
        latitude: 23.7339,
        longitude: 90.4190,
        reporterId: staff.id,
      },
    ],
  })

  // Create donations
  await prisma.donation.createMany({
    data: [
      {
        donorName: 'Bangladesh Red Crescent',
        donorEmail: 'relief@redcrescent.bd',
        type: 'MEDICINE',
        itemName: 'First Aid Kits & Antibiotics',
        quantity: 200,
        unit: 'boxes',
        message: 'Emergency medical supplies for flood-affected areas.',
        status: 'RECEIVED',
        userId: admin.id,
      },
      {
        donorName: 'Anika Patel',
        donorEmail: 'citizen@crisisconnect.org',
        type: 'MONEY',
        amount: 5000,
        message: 'For the families affected by the Mirpur fire.',
        status: 'RECEIVED',
        userId: citizen.id,
      },
      {
        donorName: 'FoodBank BD',
        donorPhone: '+880-2-8765432',
        type: 'FOOD',
        itemName: 'Rice & Dry Food Packs',
        quantity: 500,
        unit: 'packs',
        message: 'Weekly food supply for shelters.',
        status: 'DISTRIBUTED',
      },
      {
        donorName: 'Marcus Rivera',
        type: 'CLOTHING',
        itemName: 'Winter Blankets & Clothing',
        quantity: 150,
        unit: 'pieces',
        message: 'Collected from community drive.',
        status: 'PLEDGED',
        userId: volunteer.id,
      },
      {
        donorName: 'Anonymous Donor',
        type: 'MONEY',
        amount: 25000,
        message: 'Please use where most needed.',
        status: 'RECEIVED',
      },
      {
        donorName: 'PharmaCare Ltd.',
        donorEmail: 'csr@pharmacare.bd',
        type: 'MEDICINE',
        itemName: 'ORS, Paracetamol, Saline',
        quantity: 1000,
        unit: 'units',
        status: 'RECEIVED',
      },
    ],
  })

  // ===== EMERGENCY CONTACTS =====
  await prisma.emergencyContact.createMany({
    data: [
      { name: 'Dhaka Medical College Hospital', category: 'HOSPITAL', phone: '02-55165088', address: 'Secretariat Rd, Dhaka 1000', latitude: 23.7256, longitude: 90.3978, isVerified: true, operatingHours: '24/7', notes: 'Largest public hospital. Has emergency trauma unit.' },
      { name: 'National Fire Service — Station 1', category: 'FIRE_STATION', phone: '999', altPhone: '02-9555555', address: 'Kakrail, Dhaka 1000', latitude: 23.7370, longitude: 90.4100, isVerified: true, operatingHours: '24/7' },
      { name: 'Ramna Model Police Station', category: 'POLICE', phone: '999', altPhone: '02-9556789', address: 'Ramna, Dhaka 1217', latitude: 23.7365, longitude: 90.3999, isVerified: true, operatingHours: '24/7' },
      { name: 'Ambulance Emergency Hotline', category: 'AMBULANCE', phone: '199', address: 'Nationwide', isVerified: true, operatingHours: '24/7', notes: 'National emergency ambulance service.' },
      { name: 'DESCO Electric Emergency', category: 'UTILITY', phone: '02-9898090', address: 'Dhaka North', latitude: 23.7925, longitude: 90.4078, isVerified: true, operatingHours: '24/7', notes: 'For power outage and electrical emergencies.' },
      { name: 'BRAC Emergency Response', category: 'NGO', phone: '02-9881265', email: 'emergency@brac.net', address: 'Mohakhali, Dhaka 1212', latitude: 23.7782, longitude: 90.4067, isVerified: true, operatingHours: '8AM-10PM', notes: 'Disaster relief and humanitarian aid.' },
      { name: 'Bangladesh Red Crescent Society', category: 'NGO', phone: '02-9116563', email: 'info@bdrcs.org', address: '684-686 Bara Maghbazar, Dhaka', latitude: 23.7480, longitude: 90.4120, isVerified: true, operatingHours: '9AM-6PM' },
      { name: 'Shaheed Suhrawardy Medical College', category: 'HOSPITAL', phone: '02-8411014', address: 'Sher-e-Bangla Nagar, Dhaka 1207', latitude: 23.7612, longitude: 90.3755, isVerified: true, operatingHours: '24/7' },
    ],
  })

  // ===== COMMUNITY POSTS =====
  const post1 = await prisma.communityPost.create({
    data: {
      title: 'Water distribution at Mirpur Central Shelter',
      content: 'Clean drinking water is being distributed at Mirpur Central Shelter from 8 AM to 6 PM. Bring your own containers. Limit 10 liters per family per day. Volunteers needed for evening shift!',
      category: 'UPDATE',
      isPinned: true,
      authorId: staff.id,
    },
  })
  const post2 = await prisma.communityPost.create({
    data: {
      title: 'Need baby formula and diapers urgently',
      content: 'We have 5 infants at the Old Dhaka Relief Camp with no baby supplies. If anyone can donate baby formula (any brand), diapers (size 2-3), and baby wipes, please contact the shelter manager. Very urgent!',
      category: 'REQUEST',
      authorId: citizen.id,
    },
  })
  await prisma.communityPost.create({
    data: {
      title: 'Thank you to all volunteers at Zone A!',
      content: 'On behalf of all families evacuated from the Mirpur flood zone, I want to express our heartfelt gratitude to the 50+ volunteers who worked through the night. You carried elderly residents, guided children, and set up the shelter. We are safe because of you. 🙏',
      category: 'GRATITUDE',
      authorId: citizen.id,
    },
  })
  await prisma.communityPost.create({
    data: {
      title: 'Can someone explain the evacuation route from Motijheel?',
      content: 'I live near the Motijheel area and I am confused about which route to take if an evacuation is ordered. The map shows a route but I am not sure about transport options. Can anyone help?',
      category: 'QUESTION',
      authorId: citizen.id,
    },
  })
  await prisma.communityPost.create({
    data: {
      title: 'Offering free rides for evacuees — 7-seater van',
      content: 'I have a 7-seater van and I am willing to help transport families from flood-affected areas. Available all week from 6 AM to 10 PM. Call me to arrange pickup. Priority to elderly and families with small children.',
      category: 'OFFER',
      authorId: volunteer.id,
    },
  })

  // Add comments
  await prisma.postComment.createMany({
    data: [
      { content: 'Thank you for this update! What about the Uttara shelter — is water available there too?', postId: post1.id, authorId: citizen.id },
      { content: 'Yes, Uttara also has water distribution. Same timing 8AM-6PM.', postId: post1.id, authorId: staff.id },
      { content: 'I have some formula and diapers I can bring. Will come by tomorrow morning around 9 AM. Stay strong!', postId: post2.id, authorId: volunteer.id },
      { content: 'BRAC office in Mohakhali also has baby supplies. You can contact them.', postId: post2.id, authorId: staff.id },
    ],
  })

  // ===== TASKS =====
  const incidentsList = await prisma.incident.findMany({ take: 3 })
  await prisma.task.createMany({
    data: [
      { title: 'Set up water purification station', description: 'Install portable water purification system at Mirpur Central Shelter. Equipment is stored in Warehouse B.', priority: 'HIGH', status: 'IN_PROGRESS', category: 'LOGISTICS', dueDate: new Date('2026-02-24'), location: 'Mirpur Central Shelter', createdById: staff.id, assigneeId: volunteer.id, incidentId: incidentsList[0]?.id },
      { title: 'Inspect damaged bridge at Demra', description: 'Structural inspection needed for the pedestrian bridge near Demra ferry terminal. Reports of cracks after recent flooding.', priority: 'URGENT', status: 'TODO', category: 'REPAIR', dueDate: new Date('2026-02-23'), location: 'Demra Ferry Terminal', createdById: admin.id, assigneeId: staff.id },
      { title: 'Distribute medicine kits to shelters', description: 'Deliver 50 first-aid kits and ORS packets to 5 shelters in Dhaka North. Kits are ready at BRAC warehouse.', priority: 'HIGH', status: 'TODO', category: 'MEDICAL', dueDate: new Date('2026-02-24'), location: 'BRAC Warehouse, Mohakhali', createdById: staff.id, assigneeId: volunteer.id },
      { title: 'Night patrol — Zone A perimeter', description: 'Security patrol around Zone A evacuation perimeter. Check for unauthorized entry and monitor water levels.', priority: 'MEDIUM', status: 'DONE', category: 'PATROL', location: 'Mirpur Zone A', createdById: staff.id, assigneeId: staff.id },
      { title: 'Clear debris from school road', description: 'Fallen tree and debris blocking the access road to Mirpur School. Need 4 volunteers with chainsaws and clearing tools.', priority: 'MEDIUM', status: 'TODO', category: 'CLEANUP', dueDate: new Date('2026-02-25'), location: 'Mirpur Section 12', createdById: staff.id },
      { title: 'Register new evacuees at Uttara shelter', description: 'Process 30+ new families arriving from northern flood areas. Document names, needs, and medical conditions.', priority: 'HIGH', status: 'IN_PROGRESS', category: 'LOGISTICS', location: 'Uttara Assembly Point', createdById: staff.id, assigneeId: citizen.id },
      { title: 'Rescue operation — trapped family in Demra', description: 'Family of 4 reported trapped on 2nd floor of building in Demra. Water level at 5 feet. Need boat team.', priority: 'URGENT', status: 'DONE', category: 'RESCUE', location: 'Demra, Block C', createdById: admin.id, assigneeId: staff.id, incidentId: incidentsList[1]?.id },
    ],
  })

  // ===== SUPPLY REQUESTS =====
  await prisma.supplyRequest.createMany({
    data: [
      { itemName: 'Drinking Water', category: 'WATER', quantity: 500, unit: 'liters', urgency: 'CRITICAL', status: 'APPROVED', reason: 'Current water stock at Uttara shelter is critically low. 200+ families depend on daily water supply. Existing stock will last only 12 hours.', requesterId: staff.id, fromShelterId: shelters[0].id, toShelterId: shelters[1].id, approvedById: admin.id },
      { itemName: 'Rice & Lentils', category: 'FOOD', quantity: 200, unit: 'kg', urgency: 'HIGH', status: 'PENDING', reason: 'Food supplies running low at Old Dhaka shelter. Expected influx of 50 more families from Keraniganj tomorrow. Need 3-day buffer stock.', requesterId: staff.id, fromShelterId: shelters[0].id, toShelterId: shelters[2].id },
      { itemName: 'First Aid Kits', category: 'MEDICINE', quantity: 30, unit: 'boxes', urgency: 'HIGH', status: 'IN_TRANSIT', reason: 'Multiple minor injuries reported after building collapse near shelter area. Current medical supplies insufficient for patient load.', requesterId: staff.id, fromShelterId: shelters[2].id, toShelterId: shelters[0].id, approvedById: admin.id },
      { itemName: 'Blankets', category: 'EQUIPMENT', quantity: 100, unit: 'pieces', urgency: 'MEDIUM', status: 'DELIVERED', reason: 'Night temperatures dropping. Many evacuees arrived without warm clothing. Need blankets for elderly and children.', requesterId: staff.id, fromShelterId: shelters[1].id, toShelterId: shelters[0].id, approvedById: admin.id },
      { itemName: 'ORS Packets', category: 'MEDICINE', quantity: 500, unit: 'packets', urgency: 'CRITICAL', status: 'PENDING', reason: 'Diarrhea outbreak among children at Mirpur shelter. ORS stock depleted. Urgent resupply needed to prevent dehydration cases.', requesterId: staff.id, fromShelterId: shelters[0].id, toShelterId: shelters[1].id },
      { itemName: 'Portable Generators', category: 'EQUIPMENT', quantity: 3, unit: 'units', urgency: 'MEDIUM', status: 'REJECTED', reason: 'Power outage at secondary shelter. Need generators for medical equipment and lighting.', notes: 'Rejected: No spare generators available. DESCO contacted for priority power restoration.', requesterId: staff.id, fromShelterId: shelters[2].id, toShelterId: shelters[1].id, approvedById: admin.id },
    ],
  })

  // ===== AREA ALERTS =====
  await prisma.areaAlert.createMany({
    data: [
      { title: 'EVACUATE: Flash Flood — Mirpur Section 10-12', message: 'Immediate evacuation ordered for Mirpur Section 10, 11, and 12 due to rapidly rising water levels in the Turag River. Water level has crossed danger mark by 1.2 meters.\n\nEvacuation routes:\n→ Section 10: Move north via Mirpur Road to Central Shelter\n→ Section 11-12: Move east via Pallabi Road to Uttara Assembly Point\n\nDo NOT attempt to cross flooded roads. Emergency boats deployed at key intersections.', alertType: 'EVACUATION', severity: 'CRITICAL', targetArea: 'Mirpur Section 10-12', latitude: 23.8069, longitude: 90.3687, radiusKm: 3, recipientCount: 1250, createdById: admin.id },
      { title: 'Cyclone Shelter Advisory — Cox\'s Bazar Coast', message: 'All residents within 2km of the coastline are advised to move to designated cyclone shelters immediately. Cyclone expected to make landfall within 18 hours.\n\nNearest shelters:\n• Cox\'s Bazar Central Shelter (capacity: 5000)\n• Kolatoli School Shelter (capacity: 2000)\n• Laboni Beach Community Center (capacity: 1500)\n\nBring essential documents, medications, and 48-hour food supply.', alertType: 'WARNING', severity: 'HIGH', targetArea: 'Cox\'s Bazar Coastline', latitude: 21.4272, longitude: 92.0058, radiusKm: 5, recipientCount: 3400, createdById: admin.id },
      { title: 'Water Contamination — Old Dhaka', message: 'Municipal water supply in Chawkbazar and Lalbagh areas has been contaminated due to sewage line damage. DO NOT drink tap water until further notice.\n\nSafe water distribution points:\n• Chawkbazar Mosque (8AM-8PM)\n• Lalbagh Fort Gate (24 hours)\n\nBoil any water before consumption.', alertType: 'EMERGENCY', severity: 'HIGH', targetArea: 'Old Dhaka — Chawkbazar, Lalbagh', latitude: 23.7200, longitude: 90.4000, radiusKm: 2, recipientCount: 890, createdById: admin.id },
      { title: 'ALL CLEAR — Uttara Sector 3-5', message: 'The flood warning for Uttara Sector 3, 4, and 5 has been lifted. Water has receded below danger level. Residents may return to their homes.\n\nPlease note:\n• Check for structural damage before entering buildings\n• Do not touch downed power lines\n• Boil drinking water for the next 48 hours\n• Report any damage to the CrisisConnect app', alertType: 'ALL_CLEAR', severity: 'LOW', targetArea: 'Uttara Sector 3-5', latitude: 23.8759, longitude: 90.3795, radiusKm: 2, isActive: false, recipientCount: 670, createdById: admin.id },
    ],
  })

  console.log('✅ Seed complete!')
  console.log('\n📋 Login Credentials:')
  console.log('  Admin:     admin@crisisconnect.org / admin123')
  console.log('  Staff:     staff@crisisconnect.org / user123')
  console.log('  Volunteer: volunteer@crisisconnect.org / user123')
  console.log('  Citizen:   citizen@crisisconnect.org / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
