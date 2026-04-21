# Spesifikasi Tugas Besar 2 — IF2211 Strategi Algoritma

## Pemanfaatan Algoritma BFS dan DFS dalam Mekanisme Penelusuran CSS pada Pohon Document Object Model

**Program Studi Teknik Informatika — Sekolah Teknik Elektro dan Informatika — Institut Teknologi Bandung**  
**Semester II Tahun 2025/2026**

| Item | Detail |
|------|--------|
| **Deadline** | 25 April 2026, 23:59 WIB |
| **Tim** | 3 orang |
| **Repo** | `Tubes2_NamaKelompok` (Public paling lambat H+1 deadline, Private sebelumnya) |
| **Release** | Tag `v1.x` (semantic versioning) |

---

## 1. Deskripsi Tugas

Document Object Model (DOM) merupakan representasi terstruktur dari dokumen HTML dalam bentuk tree. Mahasiswa diminta untuk:

1. Membangun aplikasi web yang menerima input HTML (via URL scraping atau input manual)
2. Mem-parse HTML menjadi DOM Tree
3. Menelusuri tree menggunakan **BFS** atau **DFS** untuk mencari elemen yang cocok dengan **CSS Selector**
4. Memvisualisasikan pohon interaktif dengan highlight jalur traversal, statistik performa, dan traversal log

---

## 2. Komponen Penting

### 2.1 Tags

Tag HTML adalah penanda markup yang mendefinisikan struktur dan jenis elemen. Ditulis dengan `< >`, sebagian besar memiliki tag pembuka dan penutup (`<p>...</p>`), dan ada yang self-closing (`<br/>`, `<img/>`). Dalam DOM, setiap tag direpresentasikan sebagai node dengan hubungan parent-child-sibling.

### 2.2 CSS Selector

Mekanisme untuk memilih elemen HTML tertentu pada DOM agar diberi aturan style.

**Selector dasar:**

| Selector | Sintaks | Contoh | Penjelasan |
|----------|---------|--------|------------|
| Tag | `tagname` | `p` | Semua elemen `<p>` |
| Class | `.classname` | `.box` | Elemen dengan `class="box"` |
| ID | `#idname` | `#header` | Elemen dengan `id="header"` |
| Universal | `*` | `*` | Semua elemen |

**Combinator:**

| Combinator | Sintaks | Contoh | Penjelasan |
|------------|---------|--------|------------|
| Child | `>` | `div > p` | `<p>` langsung child dari `<div>` |
| Descendant | (spasi) | `div p` | `<p>` keturunan dari `<div>` |
| Adjacent Sibling | `+` | `div + p` | `<p>` tepat setelah `<div>` |
| General Sibling | `~` | `div ~ p` | `<p>` setelah `<div>` (tidak harus adjacent) |

### 2.3 HTML Parsing

Proses membaca dokumen HTML dan mengubahnya menjadi DOM Tree. Parser memproses secara berurutan, mengenali tag pembuka/penutup, dan menyusun hierarki (root = `<html>`, lalu `<head>` dan `<body>` sebagai cabang).

---

## 3. Spesifikasi Wajib

### 3.1 Input yang Diharapkan

| Input | Deskripsi |
|-------|-----------|
| URL website / teks HTML manual | Sumber dokumen HTML |
| Pilihan algoritma traversal | BFS atau DFS |
| CSS Selector | Selector yang digunakan untuk pencarian |
| Jumlah hasil | Top-N kemunculan, atau semua kemunculan |

### 3.2 Output yang Diharapkan

| # | Requirement |
|---|-------------|
| 1 | Aplikasi berbasis web: frontend (bebas) + backend (Go / C# / Rust / TypeScript) |
| 2 | Scraping HTML dari URL yang diberikan pengguna |
| 3 | Visualisasi struktur pohon DOM, disertai keterangan kedalaman maksimum tree |
| 4 | Highlight jalur traversal untuk menandai elemen-elemen yang terpengaruh |
| 5 | Menampilkan waktu pencarian dan banyak node yang dikunjungi |
| 6 | Traversal log berisi informasi tahapan penelusuran |

### 3.3 Repository

- Frontend dan backend boleh digabung atau dipisah
- Nama repo: `Tubes2_NamaKelompok` (atau `Tubes2_NamaKelompok_FE` / `_BE` jika dipisah)
- Gunakan **semantic commit** dan release tag `v1.x`

---

## 4. Spesifikasi Bonus (Maks 20 Poin)

| # | Bonus | Poin | Deskripsi |
|---|-------|------|-----------|
| 1 | **Video YouTube** | 4 | Video tentang aplikasi dengan audio, menampilkan wajah setiap anggota. Semakin menarik, semakin banyak poin. |
| 2 | **Deploy Azure VM** | 5 | Deploy via Microsoft Azure Virtual Machine agar dapat diakses publik. Gunakan email kampus untuk kredit $100 gratis. Stop/deallocate VM saat tidak dipakai. |
| 3 | **Docker** | 2 | Aplikasi dijalankan menggunakan Docker untuk frontend dan backend. |
| 4 | **Animasi Penelusuran** | 6 | Menampilkan animasi penelusuran pohon DOM untuk segala pencarian. |
| 5 | **Multithreading** | 3 | Implementasi multithreading pada BFS dan/atau DFS untuk traversal paralel (beberapa node diproses bersamaan). |
| 6 | **LCA Binary Lifting** | 3 | Implementasi Lowest Common Ancestor dengan Binary Lifting untuk menentukan ancestor terdekat dari 2 node. |

---

## 5. Tech Stack (Sesuai PRD)

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Go (`net/http` atau Gin/Chi) |
| **Frontend** | Next.js (App Router), React 18+, TypeScript |
| **Styling** | shadcn/ui + Tailwind CSS |
| **Tree Visualization** | D3.js (`d3-hierarchy`) |
| **HTML Parsing (BE)** | `golang.org/x/net/html` |
| **Containerization** | Docker + Docker Compose |
| **Deployment** | Azure VM (Ubuntu) |

---

## 6. API Endpoints (Sesuai PRD)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/scrape` | Terima URL atau raw HTML, parse menjadi DOM Tree |
| POST | `/api/traverse` | Telusuri DOM Tree dengan BFS/DFS berdasarkan CSS selector |
| POST | `/api/lca` | (Bonus) Cari Lowest Common Ancestor dari 2 node |

Detail request/response contract ada di `PRD_Tubes2_Detail.md` bagian 5.

---

## 7. Struktur Repository (Sesuai PRD)

```
Tubes2_NamaKelompok/
├── README.md
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── main.go
│   ├── handler/
│   ├── model/
│   ├── parser/
│   ├── scraper/
│   ├── selector/
│   ├── traversal/
│   └── lca/               # Bonus
├── frontend/
│   ├── Dockerfile
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── app/
└── docs/
    └── Tubes2_NamaKelompok.pdf
```

Detail lengkap ada di `PRD_Tubes2_Detail.md` bagian 3.2.

---

## 8. Ketentuan Pengumpulan

| Item | Keterangan |
|------|------------|
| Arsip | Source code yang dapat dijalankan + README, dan laporan (soft copy) |
| Google Form | Laporan dan tautan rilis dikumpulkan via Google Form |
| Keterlambatan | -1 poin per menit keterlambatan |
| Cross-platform | Program harus dapat dikompilasi di Windows dan Linux |
| Anti-run | Jika program tidak dapat dijalankan, tidak akan dinilai |

---

## 9. Ketentuan Laporan

### Struktur

| Bab | Konten |
|-----|--------|
| **Cover** | Foto bertiga (menggantikan logo Ganesha), NIM + nama, judul tubes |
| **Bab 1** | Deskripsi tugas (boleh salin spesifikasi) |
| **Bab 2** | Landasan Teori: DOM, HTML parsing, CSS Selector, BFS, DFS, Binary Lifting (jika bonus) |
| **Bab 3** | Aplikasi BFS dan DFS: pseudocode, analisis kompleksitas, perbandingan |
| **Bab 4** | Implementasi dan pengujian: screenshot UI, test case, benchmark |
| **Bab 5** | Kesimpulan dan saran |
| **Lampiran** | Link repo, link video, tabel pembagian tugas |
| **Daftar Pustaka** | Referensi |

### Pernyataan Anti-AI (Wajib)

> Tugas ini disusun sepenuhnya tanpa bantuan kecerdasan buatan (Generative AI), melainkan hasil pemikiran dan analisis mandiri.

Disertai tanda tangan ketiga anggota kelompok.

### Format

- Nama file: `Tubes2_[NamaKelompok].pdf`
- Ditulis dalam bahasa Indonesia yang baik dan benar
- Identitas per halaman harus jelas (halaman, kode kuliah)

---

## 10. Penilaian

### Bagian 1: Desain dan Analisis Laporan (45%)

| Komponen | Bobot |
|----------|-------|
| Pemahaman tugas besar | 5% |
| Analisis web scraping dan pemodelan pohon DOM | 5% |
| Perancangan algoritma traversal BFS dan DFS | 25% |
| Analisis efisiensi dan perbandingan BFS vs DFS | 10% |

### Bagian 2: Implementasi Program dan Demo (55%)

| Komponen | Bobot |
|----------|-------|
| Kesesuaian strategi BFS/DFS tertulis dengan implementasi dan demo | 15% |
| Fungsionalitas keseluruhan sesuai spesifikasi | 20% |
| Demo dan pemahaman program | 20% |

### Bagian 3: Bonus (Maks 20 Poin)

| Komponen | Poin |
|----------|------|
| Video | 4 poin |
| Deploy Azure VM | 5 poin |
| Docker | 2 poin |
| Animasi penelusuran | 6 poin |
| Multithreading | 3 poin |
| LCA Binary Lifting | 3 poin |

---

## 11. Checklist Fitur

| No | Poin | Ya | Tidak |
|----|------|----|-------|
| 1 | Aplikasi berhasil dikompilasi tanpa kesalahan | | |
| 2 | Aplikasi berhasil dijalankan | | |
| 3 | Aplikasi dapat menerima input URL web, pilihan algoritma, CSS selector, dan jumlah hasil | | |
| 4 | Aplikasi dapat melakukan scraping terhadap web pada input | | |
| 5 | Aplikasi dapat menampilkan visualisasi pohon DOM | | |
| 6 | Aplikasi dapat menelusuri pohon DOM dan menampilkan hasil penelusuran | | |
| 7 | Aplikasi dapat menandai jalur tempuh oleh algoritma | | |
| 8 | Aplikasi dapat menyimpan jalur yang ditempuh algoritma dalam traversal log | | |
| 9 | [Bonus] Membuat video | | |
| 10 | [Bonus] Deploy aplikasi | | |
| 11 | [Bonus] Implementasi animasi pada penelusuran pohon | | |
| 12 | [Bonus] Implementasi multithreading | | |
| 13 | [Bonus] Implementasi LCA Binary Lifting | | |

---

## 12. Referensi

- [CSS Selector Reference — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors)
- [Client-Server Architecture — MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview)
- [Go Documentation](https://go.dev/doc/)
- [Microsoft Azure for Students](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0144p/)
- [LCA Binary Lifting — CP-Algorithms](https://cp-algorithms.com/graph/lca_binary_lifting.html)

---

## Catatan Implementasi

Untuk detail implementasi (data model, API contract lengkap, algoritma pseudocode, UI/UX wireframe, Docker config, bonus detail), lihat **`PRD_Tubes2_Detail.md`**.
