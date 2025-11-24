# Todoist Launcher - Focus Mode App

Aplikasi desktop untuk manajemen tugas dengan sistem fokus yang ketat. Dibuat dengan Tauri + React + TypeScript.

## Fitur Utama

- **Gudang Ide**: Simpan semua ide dan tugas yang ingin dikerjakan
- **Fokus Hari Ini**: Maksimal 3 prioritas per hari (forced constraint)
- **Focus Mode**: Fullscreen mode dengan timer 25 menit
- **Sistem Konsekuensi**: Lockout aplikasi jika gagal fokus 3x
- **Reputation & Streak**: Tracking reputasi (0-100) dan streak harian
- **Progress Tracking**: Catat checkpoint setiap kali pause
- **Export Report**: Laporan harian untuk accountability
- **Share Commitment**: Share fokus ke social media

## Prerequisites

Pastikan sudah terinstall:

- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Windows
```bash
# Install Microsoft Visual Studio C++ Build Tools
# Download dari: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd todoist-launcher
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development mode**
```bash
npm run tauri dev
```

4. **Build production**
```bash
npm run tauri build
```

File executable akan tersedia di `src-tauri/target/release/`

## Cara Penggunaan

### 1. Tambah Task ke Gudang Ide
- Ketik task di input field "Apa yang ingin kamu kerjakan?"
- Tekan Enter atau klik tombol +

### 2. Pindahkan ke Fokus Hari Ini
- Hover task di Gudang Ide
- Klik icon panah atas untuk pindahkan (maksimal 3 task)

### 3. Mulai Focus Mode
- Klik tombol "MULAI" pada task
- Aplikasi akan fullscreen dengan timer 25 menit
- Fokus pada satu task sampai selesai

### 4. Pause atau Complete
- **Pause**: Wajib tulis progress yang sudah dicapai (min 5 karakter)
- **Complete**: Tandai task selesai dan keluar dari focus mode

### 5. Sistem Konsekuensi
- Gagal fokus 2x: Warning
- Gagal fokus 3x: Aplikasi terkunci 1 jam
- Reputation turun -5 setiap gagal fokus
- Reputation naik +10 setiap complete task

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with persist
- **Desktop Framework**: Tauri v2
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Project Structure

```
todoist-launcher/
├── src/
│   ├── components/
│   │   ├── AlertDialog/
│   │   ├── ExitModal/
│   │   ├── FocusMode/
│   │   ├── FocusTimer/
│   │   ├── ReputationBar/
│   │   ├── SectionHeader/
│   │   ├── TaskCard/
│   │   └── TaskInput/
│   ├── store/
│   │   └── useTaskStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   └── tauri.conf.json
└── package.json
```

## Development

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Available Scripts

```bash
npm run dev          # Run Vite dev server
npm run build        # Build for production
npm run tauri dev    # Run Tauri development mode
npm run tauri build  # Build Tauri app
```

## License

MIT
