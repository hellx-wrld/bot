# Flippy Flip Bot

![Build](https://img.shields.io/github/actions/workflow/status/yourrepo/ci.yml?branch=main)
![Test](https://img.shields.io/github/actions/workflow/status/yourrepo/test.yml?branch=main)

Bot ekonomi Discord berbasis JavaScript dengan fitur modular, dashboard web, database MongoDB, CI/CD, dan multi-bahasa.

## Fitur Bot
- Ekonomi: saldo, daily, work, transfer, leaderboard, shop, inventory, quest, bank, dsb
- Logging transaksi & error
- Command admin (hanya owner)
- Handler command prefix (`..`) dan slash command
- Multi-bahasa (otomatis sesuai pengaturan guild)

## Fitur Dashboard Web
- Login OAuth2 Discord
- Leaderboard, user list, level info
- Top up saldo (simulasi/nyata, QRIS/DANA)
- Subscription & benefit
- Analytics & insight (grafik, top spender, user aktif)
- Admin panel: CRUD item/shop, role management, audit log, backup/restore
- Multi-bahasa (id/en, mudah ditambah)
- API docs (OpenAPI/Swagger)
- Mobile friendly (Bootstrap)

## Cara Jalankan Bot
1. Install dependencies:
   ```bash
   npm install
   ```
2. Edit file `.env` dan masukkan token bot Discord, MongoDB URI, dsb.
3. Jalankan bot:
   ```bash
   npm start
   ```

## Cara Jalankan Dashboard
1. Jalankan:
   ```bash
   node dashboard/server.js
   ```
2. Buka http://localhost:3000
3. API docs: http://localhost:3000/api-docs

## Struktur Folder
- `src/commands/` : Semua command bot
- `src/database/` : Model & koneksi database
- `src/utils/` : Helper & logger
- `dashboard/` : Kode dashboard web
- `src/locales/` & `dashboard/locales/` : File multi-bahasa

## Multi-bahasa
- Bot & dashboard support multi-bahasa (id/en, bisa ditambah)
- Untuk ganti bahasa bot per server: edit field `lang` di database guild
- Untuk dashboard: set env `DASHBOARD_LANG` atau deteksi otomatis

## Kontribusi
1. Fork repo, buat branch baru
2. Tambahkan fitur/command baru di folder yang sesuai
3. Pull request dengan deskripsi jelas
4. Lihat CONTRIBUTING.md untuk detail workflow, test, dan style

## Testing
- Jalankan `npm test` untuk unit test
- Gunakan command `/test` untuk cek status bot

## Catatan Keamanan
- Jangan upload file `.env` ke publik
- Jangan log token bot

## Otomasi & Integrasi

- CI/CD: Lint, test, build otomatis via GitHub Actions
- Commit lint: Standarisasi pesan commit (conventional commits)
- Dependabot: Update dependency otomatis
- Docker: Siap untuk deployment container
- Sentry: Monitoring error (isi SENTRY_DSN di .env)
- Jest: Testing & code coverage
- VSCode: Pengaturan workspace & rekomendasi ekstensi
- .env.example: Contoh environment, gunakan dotenv-vault untuk keamanan lebih
- Changelog otomatis: Jalankan `npm run release` untuk update changelog & versi
