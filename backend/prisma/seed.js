const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // --- Tenant ---
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'freya-bar' },
    update: {},
    create: {
      slug: 'freya-bar',
      name: 'Freya Bar',
      brandColor: '#E84040',
      vatRate: 18,
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
    { number: 1,  label: 'Masa 1',    capacity: 4 },
    { number: 2,  label: 'Masa 2',    capacity: 4 },
    { number: 3,  label: 'Masa 3',    capacity: 2 },
    { number: 4,  label: 'Masa 4',    capacity: 6 },
    { number: 5,  label: 'Masa 5',    capacity: 2 },
    { number: 6,  label: 'Masa 6',    capacity: 4 },
    { number: 7,  label: 'Bahçe 1',   capacity: 4 },
    { number: 8,  label: 'Bahçe 2',   capacity: 4 },
    { number: 9,  label: 'Bahçe 3',   capacity: 6 },
    { number: 10, label: 'Bar Tezgah',capacity: 6 },
    { number: 11, label: 'VIP 1',     capacity: 8 },
    { number: 12, label: 'VIP 2',     capacity: 10 },
  ]

  for (const t of tableData) {
    await prisma.table.upsert({
      where: { tenantId_number: { tenantId: tenant.id, number: t.number } },
      update: {},
      create: { tenantId: tenant.id, ...t },
    })
  }

  console.log(`Tables: ${tableData.length} created`)

  // --- Önce mevcut menüyü temizle ---
  await prisma.menuItem.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.menuCategory.deleteMany({ where: { tenantId: tenant.id } })

  // --- Menu Categories ---
  const categories = [
    { name: 'Bira',          sortOrder: 1 },
    { name: 'Şarap',         sortOrder: 2 },
    { name: 'Kokteyl',       sortOrder: 3 },
    { name: 'Sert İçki',     sortOrder: 4 },
    { name: 'Alkolsüz',      sortOrder: 5 },
    { name: 'Sıcak İçecek',  sortOrder: 6 },
    { name: 'Atıştırmalık',  sortOrder: 7 },
    { name: 'Ana Yemek',     sortOrder: 8 },
  ]

  const categoryMap = {}

  for (const cat of categories) {
    const created = await prisma.menuCategory.create({
      data: { tenantId: tenant.id, ...cat },
    })
    categoryMap[cat.name] = created.id
  }

  console.log(`Categories: ${categories.length} created`)

  // --- Menu Items ---
  const items = [
    // Bira
    { category: 'Bira', name: 'Efes Pilsen',       price: 120, description: '50cl, soğuk servis' },
    { category: 'Bira', name: 'Efes Dark',          price: 130, description: '50cl, koyu lager' },
    { category: 'Bira', name: 'Bomonti Filtresiz',  price: 140, description: '50cl, filtresiz' },
    { category: 'Bira', name: 'Tuborg Gold',        price: 120, description: '50cl' },
    { category: 'Bira', name: 'Carlsberg',          price: 130, description: '50cl' },
    { category: 'Bira', name: 'Guinness',           price: 180, description: '50cl, İrlanda stout' },
    { category: 'Bira', name: 'Corona Extra',       price: 160, description: '35.5cl, limon ile' },
    { category: 'Bira', name: 'Craft IPA',          price: 190, description: '33cl, yerel üretim' },

    // Şarap
    { category: 'Şarap', name: 'Kırmızı Şarap (Kadeh)', price: 160, description: 'Günün şarabı, Cabernet Sauvignon' },
    { category: 'Şarap', name: 'Beyaz Şarap (Kadeh)',   price: 150, description: 'Günün şarabı, Chardonnay' },
    { category: 'Şarap', name: 'Roze Şarap (Kadeh)',    price: 150, description: 'Günün şarabı' },
    { category: 'Şarap', name: 'Kırmızı Şarap (Şişe)',  price: 580, description: 'Kavaklidere Yakut, 75cl' },
    { category: 'Şarap', name: 'Beyaz Şarap (Şişe)',    price: 560, description: 'Kavaklidere Çankaya, 75cl' },
    { category: 'Şarap', name: 'Prosecco (Şişe)',       price: 650, description: 'İtalya, köpüklü, 75cl' },

    // Kokteyl
    { category: 'Kokteyl', name: 'Mojito',           price: 220, description: 'Beyaz rom, nane, misket limonu, soda' },
    { category: 'Kokteyl', name: 'Aperol Spritz',    price: 240, description: 'Aperol, prosecco, portakal' },
    { category: 'Kokteyl', name: 'Negroni',          price: 250, description: 'Cin, Campari, vermut' },
    { category: 'Kokteyl', name: 'Cosmopolitan',     price: 240, description: 'Votka, triple sec, cranberry, misket limonu' },
    { category: 'Kokteyl', name: 'Long Island Ice Tea', price: 260, description: 'Votka, rom, cin, tequila, triple sec, kola' },
    { category: 'Kokteyl', name: 'Margarita',        price: 230, description: 'Tequila, triple sec, misket limonu' },
    { category: 'Kokteyl', name: 'Whiskey Sour',     price: 240, description: 'Bourbon, limon suyu, şurup, beyaz' },
    { category: 'Kokteyl', name: 'Espresso Martini', price: 260, description: 'Votka, kahve likörü, espresso' },
    { category: 'Kokteyl', name: 'Paloma',           price: 230, description: 'Tequila, greyfurt, misket limonu, tuz' },

    // Sert İçki
    { category: 'Sert İçki', name: 'Rakı (Tek)',         price: 130, description: 'Yeni Rakı, 45ml' },
    { category: 'Sert İçki', name: 'Rakı (Duble)',       price: 220, description: 'Yeni Rakı, 90ml' },
    { category: 'Sert İçki', name: 'Votka (Tek)',        price: 120, description: 'Absolut, 45ml' },
    { category: 'Sert İçki', name: 'Cin (Tek)',          price: 130, description: 'Beefeater, 45ml' },
    { category: 'Sert İçki', name: 'Tekila (Tek)',       price: 150, description: 'Jose Cuervo, 45ml' },
    { category: 'Sert İçki', name: 'Viski (Tek)',        price: 160, description: 'Jack Daniel\'s, 45ml' },
    { category: 'Sert İçki', name: 'Viski (Tek)',        price: 200, description: 'Jameson Irish, 45ml' },
    { category: 'Sert İçki', name: 'Rom (Tek)',          price: 140, description: 'Bacardi, 45ml' },
    { category: 'Sert İçki', name: 'Jägermeister (Tek)', price: 140, description: '45ml, soğuk servis' },

    // Alkolsüz
    { category: 'Alkolsüz', name: 'Kola',             price: 60,  description: '33cl, şişe' },
    { category: 'Alkolsüz', name: 'Light Kola',       price: 60,  description: '33cl, şişe' },
    { category: 'Alkolsüz', name: 'Soda',             price: 40,  description: '20cl' },
    { category: 'Alkolsüz', name: 'Taze Sıkılmış Portakal Suyu', price: 90, description: 'Büyük boy' },
    { category: 'Alkolsüz', name: 'Limonata',         price: 80,  description: 'Taze sıkma, nane ile' },
    { category: 'Alkolsüz', name: 'Mango Suyu',       price: 70,  description: '25cl, şişe' },
    { category: 'Alkolsüz', name: 'Meyveli Soda',     price: 55,  description: 'Çeşitli aromalar' },
    { category: 'Alkolsüz', name: 'Su',               price: 25,  description: '50cl, şişe' },
    { category: 'Alkolsüz', name: 'Ayran',            price: 40,  description: 'Soğuk servis' },
    { category: 'Alkolsüz', name: 'Alkollsüz Bira',   price: 80,  description: 'Efes Malt, 33cl' },

    // Sıcak İçecek
    { category: 'Sıcak İçecek', name: 'Türk Kahvesi',    price: 70,  description: 'İstenilen kıvamda' },
    { category: 'Sıcak İçecek', name: 'Espresso',         price: 65,  description: 'Tek shot' },
    { category: 'Sıcak İçecek', name: 'Çay',              price: 35,  description: 'Demlik çay, bardak' },
    { category: 'Sıcak İçecek', name: 'Bitki Çayı',       price: 60,  description: 'Nane, papatya veya ıhlamur' },
    { category: 'Sıcak İçecek', name: 'Sıcak Çikolata',   price: 90,  description: 'Süt ile' },

    // Atıştırmalık
    { category: 'Atıştırmalık', name: 'Karışık Kuruyemiş', price: 120, description: 'Fıstık, badem, kaju' },
    { category: 'Atıştırmalık', name: 'Cips',              price: 60,  description: 'Lays, 40g' },
    { category: 'Atıştırmalık', name: 'Nachos',            price: 140, description: 'Salsa ve guacamole ile' },
    { category: 'Atıştırmalık', name: 'Bruschetta',        price: 130, description: 'Domates, fesleğen, zeytinyağı' },
    { category: 'Atıştırmalık', name: 'Peynir Tabağı',     price: 220, description: 'Çeşitli peynirler, meyve, kraker' },
    { category: 'Atıştırmalık', name: 'Et ve Salam Tabağı',price: 260, description: 'Çeşitli şarküteri ürünleri' },
    { category: 'Atıştırmalık', name: 'Patates Kızartması',price: 100, description: 'Baharat sosu ile' },
    { category: 'Atıştırmalık', name: 'Zeytin Tabağı',     price: 80,  description: 'Karışık yeşil ve siyah zeytin' },

    // Ana Yemek
    { category: 'Ana Yemek', name: 'Cheeseburger',       price: 280, description: 'Dana köfte, cheddar, patates kızartması ile' },
    { category: 'Ana Yemek', name: 'Club Sandviç',       price: 240, description: 'Tavuk, bacon, domates, marul' },
    { category: 'Ana Yemek', name: 'Izgara Köfte',       price: 260, description: 'Pilav ve salata ile' },
    { category: 'Ana Yemek', name: 'Kanat (6 Adet)',     price: 220, description: 'Baharatlı tavuk kanadı, sos ile' },
    { category: 'Ana Yemek', name: 'Kanat (12 Adet)',    price: 380, description: 'Baharatlı tavuk kanadı, sos ile' },
    { category: 'Ana Yemek', name: 'Sezar Salata',       price: 160, description: 'Tavuk, parmesan, kruton' },
    { category: 'Ana Yemek', name: 'Fish & Chips',       price: 300, description: 'Balık fileto, patates, tartar sos' },
  ]

  for (const item of items) {
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
