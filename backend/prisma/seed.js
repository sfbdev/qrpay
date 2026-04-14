const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // --- Tenant ---
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'freya-cafe' },
    update: {},
    create: {
      slug: 'freya-cafe',
      name: 'Freya Cafe & Bistro',
      brandColor: '#E84040',
      vatRate: 10,
      currency: 'TRY',
      orderApprovalRequired: true,
    },
  })

  console.log(`Tenant: ${tenant.name} (${tenant.id})`)

  // --- Admin User ---
  const passwordHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: {
      tenantId_username: { tenantId: tenant.id, username: 'admin' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Admin',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log(`Admin user: ${admin.username} (${admin.id})`)

  // --- Cashier User ---
  const cashierHash = await bcrypt.hash('kasa123', 10)

  const cashier = await prisma.user.upsert({
    where: {
      tenantId_username: { tenantId: tenant.id, username: 'kasa' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Kasa',
      username: 'kasa',
      passwordHash: cashierHash,
      role: 'CASHIER',
    },
  })

  console.log(`Cashier user: ${cashier.username} (${cashier.id})`)

  // --- Tables ---
  const tableData = [
    { number: 1, label: 'Masa 1', capacity: 4 },
    { number: 2, label: 'Masa 2', capacity: 4 },
    { number: 3, label: 'Masa 3', capacity: 2 },
    { number: 4, label: 'Masa 4', capacity: 6 },
    { number: 5, label: 'Masa 5', capacity: 2 },
    { number: 6, label: 'Bahce 1', capacity: 4 },
    { number: 7, label: 'Bahce 2', capacity: 4 },
    { number: 8, label: 'VIP', capacity: 8 },
  ]

  for (const t of tableData) {
    await prisma.table.upsert({
      where: { tenantId_number: { tenantId: tenant.id, number: t.number } },
      update: {},
      create: { tenantId: tenant.id, ...t },
    })
  }

  console.log(`Tables: ${tableData.length} created`)

  // --- Menu Categories ---
  const categories = [
    { name: 'Kahvalti', sortOrder: 1 },
    { name: 'Ana Yemekler', sortOrder: 2 },
    { name: 'Salatalar', sortOrder: 3 },
    { name: 'Icecekler', sortOrder: 4 },
    { name: 'Tatlilar', sortOrder: 5 },
  ]

  const categoryMap = {}

  for (const cat of categories) {
    const existing = await prisma.menuCategory.findFirst({
      where: { tenantId: tenant.id, name: cat.name },
    })

    if (existing) {
      categoryMap[cat.name] = existing.id
    } else {
      const created = await prisma.menuCategory.create({
        data: { tenantId: tenant.id, ...cat },
      })
      categoryMap[cat.name] = created.id
    }
  }

  console.log(`Categories: ${categories.length} created`)

  // --- Menu Items ---
  const items = [
    // Kahvalti
    { category: 'Kahvalti', name: 'Serpme Kahvalti', price: 350, description: '2 kisilik zengin kahvalti tabagi' },
    { category: 'Kahvalti', name: 'Menemen', price: 120, description: 'Geleneksel menemen' },
    { category: 'Kahvalti', name: 'Sucuklu Yumurta', price: 110, description: null },

    // Ana Yemekler
    { category: 'Ana Yemekler', name: 'Adana Kebap', price: 280, description: 'El yapimi adana kebap, pilav ve salata ile' },
    { category: 'Ana Yemekler', name: 'Iskender', price: 300, description: 'Tereyagli iskender kebap' },
    { category: 'Ana Yemekler', name: 'Kofte', price: 220, description: 'Izgara kofte, pilav ve salata' },
    { category: 'Ana Yemekler', name: 'Tavuk Sis', price: 200, description: 'Marine tavuk sis, pilav ile' },
    { category: 'Ana Yemekler', name: 'Karisik Izgara', price: 380, description: '2 kisilik karisik et tabagi' },

    // Salatalar
    { category: 'Salatalar', name: 'Coban Salata', price: 80, description: null },
    { category: 'Salatalar', name: 'Sezar Salata', price: 130, description: 'Tavuklu sezar salata' },
    { category: 'Salatalar', name: 'Mevsim Salata', price: 70, description: null },

    // Icecekler
    { category: 'Icecekler', name: 'Ayran', price: 30, description: null },
    { category: 'Icecekler', name: 'Kola', price: 50, description: null },
    { category: 'Icecekler', name: 'Cay', price: 25, description: 'Bardak cay' },
    { category: 'Icecekler', name: 'Turk Kahvesi', price: 60, description: null },
    { category: 'Icecekler', name: 'Limonata', price: 55, description: 'Taze sikma limonata' },
    { category: 'Icecekler', name: 'Su', price: 15, description: null },

    // Tatlilar
    { category: 'Tatlilar', name: 'Kunefe', price: 150, description: 'Sicak kunefe, dondurma ile' },
    { category: 'Tatlilar', name: 'Baklava', price: 130, description: '6 parca fistikli baklava' },
    { category: 'Tatlilar', name: 'Sutlac', price: 80, description: 'Firin sutlac' },
  ]

  for (const item of items) {
    const existing = await prisma.menuItem.findFirst({
      where: { tenantId: tenant.id, name: item.name },
    })

    if (!existing) {
      await prisma.menuItem.create({
        data: {
          tenantId: tenant.id,
          categoryId: categoryMap[item.category],
          name: item.name,
          description: item.description,
          price: item.price,
          available: true,
        },
      })
    }
  }

  console.log(`Menu items: ${items.length} created`)

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
