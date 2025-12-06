Untuk mengganti favicon pada proyek Next.js ini, Anda perlu mengikuti dua langkah utama, berdasarkan file `app/layout.js`:

### 1. Lokasi Konfigurasi Favicon

Konfigurasi favicon berada di dalam file `app/layout.js` pada objek `metadata`. Path menunjuk ke `/favicon.ico`.

```javascript
// app/layout.js

export const metadata = {
  title: "Portofolio M. Taufiq, M.Kom",
  description: "Welcome to my personal portfolio website!",
  icons: {
    icon: "/favicon.ico", // <-- Path ke favicon Anda
  },
};
```

### 2. Mengganti File Favicon

File `favicon.ico` yang sebenarnya terletak di dalam direktori `app/`.

**Cara termudah adalah:**
- Ganti file yang ada di `app/favicon.ico` dengan file `.ico` baru Anda. Pastikan nama filenya tetap `favicon.ico`.

**Jika Anda ingin menggunakan file lain (seperti .png):**
1. Tempatkan file baru Anda (misalnya `logo.png`) di dalam direktori `app/`.
2. Ubah path di `metadata` pada file `app/layout.js` agar sesuai:
   ```javascript
   // app/layout.js
   icons: {
     icon: "/logo.png", 
   },
   ```

Setelah melakukan perubahan tersebut, server pengembangan Next.js akan secara otomatis menggunakan favicon yang baru.
