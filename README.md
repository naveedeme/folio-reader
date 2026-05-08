# 📖 Folio — Browser Ebook Reader

> A premium, zero-dependency ebook reader that runs entirely in your browser.  
> No account. No server. No install required — or install it as a PWA and read offline.

**[→ Open Folio](https://naveedeme.github.io/folio-reader)**

---

## Features

### Formats supported
| Format | Notes |
|--------|-------|
| **EPUB** | Full zip parsing, spine order, inline images, NCX table of contents |
| **PDF** | Rendered via PDF.js at full device resolution, selectable text layer |
| **DOCX / DOC** | Converted to styled HTML via Mammoth.js |
| **TXT** | Auto-split into chapters by headings or word count |
| **Markdown** | Full syntax rendering with headings, code, blockquotes, tables |
| **HTML** | Rendered as-is with reader styling applied |
| **RTF** | Control codes stripped, content displayed cleanly |

### Reading experience
- **Dark, Light, and Sepia** themes — switches the canvas, page surface, and all UI
- **Font** family, **size** (10–42 px), **line height**, **page width**, and **text alignment** — all live-adjustable
- **Vertical text** layout (vertical-rl, vertical-lr) for CJK reading
- **Single-page** mode with left/right click zones for turning pages
- **Continuous scroll** mode — all chapters stacked with chapter dividers
- **Zoom** control (25–400%) scales the page surface, not the scroll container
- **PDF fit-width / fit-page** buttons plus a dedicated scale slider
- Reading **progress bar** and **page indicator** in the toolbar

### Library
- Books are stored locally — file blobs in **IndexedDB**, metadata in **localStorage**
- Card grid with cover art (extracted from EPUB), format badge, and progress bar
- Reopens the last-read book automatically on next visit

### Table of contents
- Parsed from EPUB NCX navPoints
- Auto-generated from headings for text-based formats
- Click any entry to jump to that chapter

### Highlights & notes
- Select text → right-click → pick a highlight colour (yellow, green, blue, pink, orange)
- Attach a written note to any highlight
- All highlights listed in the sidebar; click to jump back to that passage
- Persisted per-book in localStorage

### Search
- Live in-document search with highlighted matches
- Previous / next match navigation, keyboard shortcut **Ctrl + F**

### Text-to-speech
- **🔉 Read word** — speaks only the tapped/selected word, then stops
- **🔊 Read from here** — reads from the selection or caret to the end of the chapter
- Play / Pause / Stop controls, speed 0.5× – 2.5×
- Works on all formats including PDF (extracts text from the current page)

### Folder scanner
- Drop a folder or use the directory picker to scan recursively for supported files
- Click any result to open it instantly

### Google Drive sync *(optional)*
- OAuth 2.0 sign-in — no credentials stored in the code
- Push/pull library metadata, reading progress, and highlights
- Requires setting your own Google Client ID (see [Configuration](#configuration))

### PWA
- Installable on desktop (Chrome, Edge) and mobile (Android, iOS Safari)
- Offline-capable via service worker cache
- File handler registration — double-click an EPUB or PDF to open directly in Folio

---

## File structure

```
folio-reader/
├── index.html      # Complete app — all HTML, CSS, and JS in one file
├── manifest.json   # PWA manifest
├── sw.js           # Service worker (offline cache)
├── icon-192.png    # PWA icon
└── icon-512.png    # PWA icon (large)
```

---

## Run locally

No build step. No npm. Just a file server:

```bash
git clone https://github.com/naveedeme/folio-reader.git
cd folio-reader
python3 -m http.server 8080
```

Open **http://localhost:8080** in Chrome or Edge.

To install as a PWA from localhost, look for the **⊕** icon in the address bar after the page loads.

---

## Deploy to GitHub Pages

Folio is deployed automatically via GitHub Actions whenever you push to `main`.

Live URL: **https://naveedeme.github.io/folio-reader**

To set it up on your own fork:

1. Go to your repo → **Settings → Pages**
2. Under *Source*, select **GitHub Actions**
3. Push any change to `main` — the workflow in `.github/workflows/deploy.yml` handles the rest

---

## Configuration

### Google Drive sync

To enable Drive sync, replace the placeholder in `index.html`:

```js
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
```

Steps to get a Client ID:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials**
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add your Pages URL as an authorised JavaScript origin:
   ```
   https://naveedeme.github.io
   ```
5. Paste the Client ID into `index.html`

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next page |
| `Ctrl + F` | Open search |
| `Esc` | Close search, context menu, or settings |

---

## Browser support

| Browser | Install as PWA | Notes |
|---------|:--------------:|-------|
| Chrome 90+ | ✓ | Full support |
| Edge 90+ | ✓ | Full support |
| Firefox | — | No PWA install; reader works fully |
| Safari (iOS 16.4+) | ✓ | Add to Home Screen |

---

## Privacy

Everything stays on your device. No analytics, no tracking, no external requests except:
- PDF.js and Mammoth.js loaded from cdnjs.cloudflare.com on first use
- Google Identity Services (only if you sign in to Drive sync)

---

## License

MIT — do whatever you like with it.
