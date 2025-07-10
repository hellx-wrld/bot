# Dokumentasi API Dashboard Flippy Flip

## Endpoint

- `/` : Halaman utama dashboard
- `/leaderboard` : Leaderboard top 10 user
- `/users` : Daftar user
- `/level/:id` : Info level user
- `/login` : Login admin
- `/admin` : Panel admin (butuh login)
- `/admin/items` : Kelola item shop (butuh login)
- `/admin/items/add` : Tambah item (POST, butuh login)
- `/admin/items/edit/:id` : Edit item (GET/POST, butuh login)
- `/admin/items/delete/:id` : Hapus item (GET, butuh login)

## Autentikasi
- Login admin dengan password di `.env` (`DASHBOARD_ADMIN_PASS`)

## Localization
- Ubah bahasa dengan variabel `DASHBOARD_LANG` di `.env` (`id`/`en`)
