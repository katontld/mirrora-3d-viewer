# MirrOra 3D Interactive Web Viewer

> Penampil 3D interaktif berbasis web untuk mempresentasikan modul hardware PCB MirrOra secara real-time (orbit, pan, zoom, dan turntable auto-rotate) sebagai alternatif interaktif dari slide presentasi statis. Dioptimalkan khusus untuk penyematan (*live embed*) di slide Canva.

---

## 🚀 Fitur Unggulan

1. **EasyEDA Pro Calibrated Shaders & Textures**
   - Menggunakan model CAD asli `3D_PCB1_autoroute_2026-10-15.obj` & `.mtl`.
   - Warna FR-4 solder mask hijau khas EasyEDA Pro, pin header emas, konektor Type-C & DC 12V Jack logam, serta IC chip matte realistis.

2. **Canva Live Embed Ready (Zero UI Distraction)**
   - **Default Clean Slate**: Seluruh HUD (header, kontrol dock, kartu spesifikasi) 100% tersembunyi saat pertama kali dimuat. Modul PCB berputar murni di atas slide.
   - **Smart Hover Wake**: Arahkan kursor ke tepi bawah atau atas layar untuk memunculkan tombol kontrol, atau tekan tombol <kbd>H</kbd>.
   - **Zero Freezing saat Zoom**: Anda bisa bebas scroll mouse wheel atau pinch trackpad untuk zoom in/out detail komponen, dan modul PCB **akan terus berputar mulus tanpa freeze**.

3. **Cinematic Auto-Tour (5.0x Turbo Rotation)**
   - Kamera otomatis berputar 1 putaran penuh (360°) di sudut **Isometric 45°**, bertransisi halus ke **Port Focus** (fokus USB-C & power jack 360°), lalu kembali ke Isometric dalam perulangan (*loop*) berkelanjutan.
   - Kecepatan putar default **5.0x** (~7.5 detik per 360°), sangat pas untuk pitching presentasi.

4. **Pemilih Warna Latar Belakang Interaktif**
   - Dilengkapi preset **Dark Studio**, **Green Screen (Chroma Key)**, **White Solid (Canva)**, **Blue Screen**, **Magenta**, dan **Transparan (Alpha)**.
   - Mendukung input kode **HEX custom** dan **Pipet Warna (Eyedropper 💉)** untuk mencocokkan persis dengan latar slide Canva Anda.

5. **Perekaman Video Bebas UI (60 FPS WebM / MP4)**
   - Rekam turntable 3D berputar halus dengan satu klik atau pintasan <kbd>V</kbd>, video otomatis tersimpan langsung ke folder *Downloads*.

---

## ⌨️ Daftar Pintasan Keyboard (Presenter Shortcuts)

| Tombol | Aksi |
| :--- | :--- |
| <kbd>Spasi</kbd> | Jeda / Lanjutkan Auto-Rotate (Turntable) |
| <kbd>1</kbd> | Pindah ke Preset **Isometric 45°** |
| <kbd>2</kbd> | Pindah ke Preset **Port Focus** (USB Type-C & DC) |
| <kbd>T</kbd> | Aktifkan / Matikan **Auto-Tour** (Iso 360° ➔ Port 360° Loop) |
| <kbd>+</kbd> / <kbd>-</kbd> | Naikkan / Turunkan Kecepatan Putar (0.5x – 5.0x) |
| <kbd>B</kbd> | Buka Popover **Pemilih Warna Background** |
| <kbd>V</kbd> | Mulai / Berhenti **Rekam Video 3D Bebas UI** |
| <kbd>H</kbd> | Buka / Sembunyikan Seluruh Antarmuka (**Zen HUD**) |
| <kbd>R</kbd> | Reset View ke Orientasi Awal |
| <kbd>F</kbd> | Masuk / Keluar Mode **Layar Penuh (Fullscreen)** |
| <kbd>M</kbd> | Dialog Muat Model 3D Custom (.obj, .glb, .splinecode) |
| <kbd>?</kbd> | Buka Panduan Pintasan Keyboard |

---

## 🌐 Cara Deploy ke Vercel & Sematkan ke Canva

Canva **tidak mendukung** pengunggahan file `.html` mentah secara langsung. Canva Embeds membutuhkan URL web publik berprotokol HTTPS.

### 1. Deploy ke Vercel (Rekomendasi Cepat & Gratis)
1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik **Add New...** ➔ **Project**.
3. Pilih repository `mirrora-3d-viewer`, lalu klik **Deploy** (tanpa perlu konfigurasi build).
4. Dalam ~20 detik, Anda akan mendapatkan URL HTTPS publik gratis (contoh: `https://mirrora-3d-viewer.vercel.app`).

### 2. Sematkan Langsung ke Canva
1. Buka slide presentasi Anda di **Canva**.
2. Di bilah menu kiri, buka menu **Aplikasi (Apps)** ➔ cari dan pilih **Sematkan (Embeds)**.
3. Tempelkan link Vercel Anda (`https://...`).
4. Sesuaikan ukuran frame di slide. Modul PCB 3D MirrOra kini hidup, berputar 5.0x, dan interaktif langsung di dalam slide presentasi Anda!

---

## 💻 Menjalankan Secara Lokal

```bash
# Jalankan server lokal
python3 -m http.server 8080

# Buka di browser
open http://localhost:8080/index.html
```
