# QR GEN PRO — QR Code Generator

Aplikasi web modern untuk membuat, mengelola, dan memindai QR Code. Dibangun dengan Next.js 16, TypeScript, Tailwind CSS, dan shadcn/ui.

## ✨ Fitur

### QR Code Generator (12 Jenis)
- **URL / Website** — Tautan ke halaman web
- **Text** — Teks bebas
- **Nomor Telepon** — Nomor telepon dengan format `tel:`
- **WhatsApp** — Chat WhatsApp dengan pesan otomatis
- **Email** — Email dengan subject dan body
- **SMS** — Pesan SMS
- **WiFi** — Konfigurasi WiFi (WPA/WEP/None)
- **Kontak / vCard** — Kontak bisnis lengkap
- **Lokasi / Google Maps** — Koordinat atau alamat
- **Event / Kalender** — Event dengan format iCal
- **Pembayaran** — QRIS, GoPay, OVO, DANA, ShopeePay
- **Custom QR Code** — Konten bebas

### Kustomisasi
- Warna QR dan background (preset + custom)
- Bentuk pixel: Kotak, Membulat, Titik
- Upload logo (PNG/JPG/SVG) dengan pengaturan ukuran
- Error correction level: L, M, Q, H (default H)
- Margin / quiet zone
- Peringatan otomatis untuk kustomisasi yang berlebihan

### Download & Copy
- **Format**: PNG, JPG, SVG (vector), PDF
- **Ukuran**: 256, 512, 1024, 2048 px, atau custom
- Copy gambar QR ke clipboard
- Copy konten QR
- Copy URL

### QR Scanner
- Scan menggunakan kamera (front/back)
- Upload gambar QR Code
- Deteksi otomatis jenis QR
- Riwayat scan

### Manajemen
- **Dashboard** — Statistik + grafik (7 hari, per jenis)
- **Riwayat** — Tabel dengan search, filter jenis, filter tanggal, pagination
- **Favorit** — Tandai QR dengan bintang
- **Template** — 12 template siap pakai
- **Statistik** — Grafik 30 hari, distribusi jenis, breakdown
- **Pengaturan** — Tema, export/import data, keamanan

### Lainnya
- 🌙 Dark / Light mode
- 📱 Responsive design (desktop, tablet, mobile)
- 🔒 Mode publik (tanpa login) — data tersimpan di localStorage
- ⚡ Real-time preview
- 🎨 UI modern minimalis dengan Bahasa Indonesia
- 📊 Grafik dengan Recharts
- 🔍 Validasi form lengkap
- ✅ Quality check (kontras, logo, quiet zone)

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| QR Code | qrcode + qrcode.react |
| Scanner | html5-qrcode |
| PDF | jsPDF |
| State | Zustand + localStorage |
| Charts | Recharts |
| Database | Prisma ORM (SQLite) |
| Auth | NextAuth.js (tersedia) |
| Icons | Lucide React |

## 📦 Instalasi

### Prasyarat
- Node.js 18+ atau Bun
- npm/bun package manager

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd qr-gen-pro

# 2. Install dependencies
bun install
# atau
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env sesuai kebutuhan

# 4. Setup database
bun run db:push
# atau
npx prisma db push

# 5. Jalankan development server
bun run dev
# atau
npm run dev
```

Buka aplikasi melalui **Preview Panel** di sebelah kanan interface.

### Build untuk Production

```bash
bun run build
bun run start
```

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── qr/                 # QR CRUD endpoints
│   │   │   ├── route.ts        # GET/POST /api/qr
│   │   │   ├── generate/       # POST /api/qr/generate
│   │   │   └── [id]/           # GET/PUT/DELETE /api/qr/{id}
│   │   │       └── favorite/  # POST /api/qr/{id}/favorite
│   │   ├── scanner/decode/     # POST /api/scanner/decode
│   │   ├── templates/          # GET/POST /api/templates
│   │   └── statistics/         # GET /api/statistics
│   ├── globals.css             # Global styles + theme variables
│   ├── layout.tsx              # Root layout + metadata
│   └── page.tsx                # Main page (view router)
├── components/
│   ├── layout/
│   │   └── app-sidebar.tsx     # Responsive sidebar navigation
│   ├── qr/
│   │   ├── generate-view.tsx   # QR generator main view
│   │   ├── qr-form.tsx         # Dynamic form (12 types)
│   │   ├── type-selector.tsx   # QR type grid selector
│   │   ├── customization-panel # Colors, logo, error correction
│   │   ├── qr-preview.tsx      # Real-time SVG preview
│   │   ├── preview-panel.tsx   # Preview + download/copy/save
│   │   ├── download-dialog.tsx # Download modal (PNG/JPG/SVG/PDF)
│   │   ├── scanner-view.tsx    # QR scanner with camera
│   │   ├── dashboard-view.tsx  # Dashboard with stats + charts
│   │   ├── history-view.tsx    # History table with filters
│   │   ├── favorites-view.tsx  # Favorites grid
│   │   ├── templates-view.tsx  # Templates grid
│   │   ├── statistics-view.tsx # Statistics with charts
│   │   └── settings-view.tsx   # Settings page
│   ├── ui/                     # shadcn/ui components
│   └── theme-provider.tsx      # Dark/light theme provider
├── lib/
│   ├── db.ts                   # Prisma client
│   ├── utils.ts                # Utility functions (cn)
│   └── qr/
│       ├── qr-types.ts         # Type definitions
│       ├── qr-content.ts      # Content generators (12 types)
│       ├── qr-download.ts      # Download + quality check
│       └── qr-validation.ts    # Form validation
├── store/
│   └── qr-store.ts             # Zustand store + templates
└── hooks/
    ├── use-mobile.ts
    └── use-toast.ts
```

## 📡 API Documentation

### Base URL
```
/api
```

### Endpoints

#### QR Codes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/qr` | List semua QR Code (query: `type`, `limit`, `offset`) |
| POST | `/api/qr` | Buat QR Code baru |
| POST | `/api/qr/generate` | Alias buat QR Code |
| GET | `/api/qr/{id}` | Ambil QR Code by ID |
| PUT | `/api/qr/{id}` | Update QR Code |
| DELETE | `/api/qr/{id}` | Hapus QR Code |
| POST | `/api/qr/{id}/favorite` | Toggle favorite |

#### Scanner

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/scanner/decode` | Deteksi jenis QR dari konten |

#### Templates

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/templates` | List semua template |
| POST | `/api/templates` | Buat template baru |

#### Statistics

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/statistics` | Statistik QR Code (query: `userId`) |

### Contoh Request

```bash
# Buat QR Code
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QR Website",
    "type": "url",
    "content": "https://example.com",
    "customization": {
      "fgColor": "#000000",
      "bgColor": "#ffffff",
      "errorCorrectionLevel": "H"
    }
  }'

# Decode QR
curl -X POST http://localhost:3000/api/scanner/decode \
  -H "Content-Type: application/json" \
  -d '{ "content": "https://wa.me/628123456789" }'
```

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  role      String   @default("USER")  // USER | ADMIN
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model QrCode {
  id            String   @id @default(cuid())
  userId        String?
  name          String
  type          String
  content       String
  customization String?
  filePath      String?
  isPublic      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  qrCodeId  String
  createdAt DateTime @default(now())
}

model Template {
  id            String   @id @default(cuid())
  name          String
  type          String
  configuration String
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  metadata  String?
  createdAt DateTime @default(now())
}
```

## 🔒 Keamanan

- Input validation pada semua form
- Sanitasi konten QR Code
- Validasi URL (deteksi HTTP, domain mencurigakan)
- File upload validation (PNG/JPG/SVG, max 2MB)
- Validasi MIME type untuk logo
- Quality check sebelum download (kontras, logo size, quiet zone)
- XSS protection (React built-in)
- Data tersimpan lokal di browser (privacy by design)

## 🎨 QR Code Quality Check

Sebelum QR Code dapat didownload, sistem melakukan pemeriksaan:
- ✅ QR dapat di-decode
- ✅ Kontras warna cukup (WCAG ratio)
- ✅ Logo tidak terlalu besar (max 35%)
- ✅ Quiet zone tersedia (margin ≥ 1)
- ✅ Error correction sesuai (H saat menggunakan logo)

## 📱 PWA Support

Aplikasi mendukung Progressive Web App:
- Installable di smartphone
- Dapat dibuka seperti aplikasi native
- Mendukung offline generation untuk QR sederhana

## 🌐 Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 📝 Lisensi

MIT License — Bebas digunakan untuk keperluan personal dan komersial.

---

**QR GEN PRO** — Dibuat dengan ❤️ menggunakan Next.js
