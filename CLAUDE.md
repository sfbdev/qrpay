# QRPay — Proje Bağlamı

## Proje Nedir?

Restoran yönetim ve ödeme sistemi. Üç bağımsız uygulama içeren monorepo yapısında:

| Klasör | Uygulama | Hedef Kitle |
|--------|----------|-------------|
| `customer-web/` | Müşteri web uygulaması | Masadaki misafirler (QR kod ile) |
| `kiosk/` | Yönetim paneli | Restoran yöneticisi/kasiyer (masaüstü) |
| `waiter-app/` | Garson uygulaması | Garsonlar — **Faz 2'ye ertelendi** |

---

## Teknoloji Yığını

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Router:** Vue Router 4
- **Build:** Vite 8
- **Styling:** Saf CSS (CSS custom properties — Tailwind/Bootstrap YOK)
- **UI Kütüphanesi:** YOK — tüm component'lar sıfırdan yazılmış
- **State:** Component-local `ref`/`reactive` + `localStorage` (Pinia/Vuex YOK)
- **Mobil:** Capacitor 8 (sadece `waiter-app/`)
- **Dil:** JavaScript (TypeScript YOK)
- **i18n:** Inline TR/EN nesneleri (harici i18n kütüphanesi YOK)
- **Backend:** Henüz entegre değil — tüm veriler mock'lanmış

---

## Klasör Yapısı (her app için ortak)

```
[app]/
├── src/
│   ├── views/          # Sayfa bileşenleri (router'a bağlı)
│   ├── components/     # Yeniden kullanılabilir bileşenler
│   │   └── layout/     # AppShell, navigasyon
│   ├── composables/    # useTheme, useFullscreen (kiosk)
│   ├── router.js       # Route tanımları
│   ├── App.vue         # Kök bileşen (sadece <RouterView />)
│   ├── main.js         # Vue app başlatma
│   └── style.css       # Global CSS değişkenleri
├── index.html
├── vite.config.js
└── package.json
```

---

## Route Yapısı

### customer-web
```
/r/:tenant/t/:tableId         → LanguageSelect (giriş)
/r/:tenant/t/:tableId/join    → NameEntry (isim)
/r/:tenant/t/:tableId/bill    → TableView (ana ekran)
/r/:tenant/t/:tableId/closed  → ThankYou
/no-session                    → NoSession (hata)
```

### kiosk
```
/login             → Login
/app/dashboard     → Dashboard (KPI'lar)
/app/tables        → Masa yönetimi
/app/orders        → Sipariş takibi
/app/cashier       → Kasa/ödeme
/app/menu          → Menü yönetimi
/app/staff         → Personel
/app/settings      → Ayarlar
```

### waiter-app
```
/login                    → Login
/app/tables               → Masa listesi
/app/tables/:id           → Masa detayı
/app/tables/:id/order     → Yeni sipariş
/app/orders               → Aktif siparişler
```

---

## Önemli Konvansiyonlar

### Mock Veri Paterni
Tüm veriler component içinde mock'lanmış, gerçek backend entegrasyonu yok:
```javascript
// --- Mock data (backend'den gelecek) ---
const items = ref([{ id: 1, name: 'Adana Kebap', price: 280 }])
```

### i18n Paterni
```javascript
const i18n = { tr: { title: 'Başlık' }, en: { title: 'Title' } }
const lang = ref(localStorage.getItem('qrpay_lang') || 'tr')
const t = computed(() => i18n[lang.value] || i18n.tr)
```

### Tema Sistemi
- `localStorage` anahtarı: `qrpay-theme`
- Composable: `useTheme()` (sadece kiosk)
- Marka rengi: `#E84040` (kırmızı)
- Light/dark CSS değişkenleri `style.css` içinde

### localStorage Anahtarları
| Anahtar | İçerik | Kullanım Yeri |
|---------|--------|---------------|
| `qrpay_lang` | `'tr'` / `'en'` | customer-web |
| `qrpay_name` | Misafir adı | customer-web |
| `qrpay-theme` | `'light'` / `'dark'` | kiosk |
| `qrpay-sidebar` | `'collapsed'` | kiosk |

### Fiyat Formatlama
```javascript
'₺' + value.toLocaleString('tr-TR')
```

### İkon Yaklaşımı
Harici ikon kütüphanesi yok — emoji kullanılıyor (⌂ ▦ ☰ ₺ ⚇ vb.)

---

## Komutlar

Her üç app için aynı:
```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Build önizleme
```

---

## Sipariş Akışı (Faz 1)

İki yol:
1. **Garson:** Kağıda sipariş alır → kiosk'tan masa seçip girer → direkt onaylı olarak mutfağa düşer
2. **Müşteri:** QR okutur → sipariş oluşturur → kiosk'taki onay ayarına göre (bkz. aşağıda)

### Sipariş Onay Ayarı (Settings)
`order_approval_required` — tenant bazlı ayar:
- **Kapalı:** Müşteri siparişi direkt mutfağa düşer (`approved`)
- **Açık:** Müşteri siparişi kiosk onayı bekler (`pending_approval`)
Garson kiosk'tan girdiği siparişler bu ayardan bağımsız, her zaman direkt onaylı.

## Mevcut Eksikler / Yapılacaklar

- [ ] Backend API entegrasyonu (tüm veriler mock'lanmış)
- [ ] Gerçek authentication (login formları sahte)
- [ ] Kiosk: garson sipariş giriş ekranı
- [ ] Kiosk: masa açma (kiosk üzerinden)
- [ ] Settings: `order_approval_required` toggle
- [ ] Linting/formatting (ESLint/Prettier kurulu değil)
- [ ] Test altyapısı yok
- [ ] TypeScript migration (ihtiyaç duyulursa)

---

## Geliştirme Notları

- Her app **bağımsız** çalışır — ortak paket/bileşen paylaşımı yok
- Tüm CSS sıfırdan yazılmış — yeni bileşenler eklerken mevcut CSS değişkenlerini kullan
- `customer-web` mobil öncelikli tasarım (max-width: 430px)
- `kiosk` masaüstü tam ekran tasarımı
- `waiter-app` mobil öncelikli + Capacitor safe-area desteği
