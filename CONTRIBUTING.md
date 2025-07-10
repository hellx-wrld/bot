# Contributing to Flippy Flip Bot

Terima kasih telah tertarik berkontribusi!

## Cara Kontribusi
1. Fork repo ini dan buat branch baru.
2. Tambahkan fitur, perbaikan bug, atau dokumentasi.
3. Pastikan kode sudah di-lint dan test (`npm run lint`, `npm test`).
4. Buat pull request dengan deskripsi jelas.

## Standar Kode
- Gunakan Prettier & ESLint (otomatis saat commit).
- Ikuti conventional commits untuk pesan commit.

## Testing
- Tambahkan unit test untuk fitur baru jika memungkinkan.
- Jalankan `npm test` untuk memastikan semua test lolos.

## CI/CD
- Build dan test otomatis via GitHub Actions (lihat badge di README).
- PR yang gagal build/test tidak akan di-merge.

## Jalankan Dashboard & API Docs
- Dashboard: `node dashboard/server.js` (lihat di http://localhost:3000)
- API Docs: buka http://localhost:3000/api-docs

## Multi-bahasa
- Untuk command bot: edit file di `src/locales/` dan gunakan utilitas `getBotLocale`.
- Untuk dashboard: edit file di `dashboard/locales/`.
- Untuk menambah bahasa baru, copy file `id.json` lalu terjemahkan.

## Diskusi & Issue
- Gunakan GitHub Issues untuk diskusi fitur/bug.

Happy coding!
