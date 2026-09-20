# Asrum Launcher

Ban desktop (Tauri v2) cua evowars.io — tai truc tiep https://evowars.io/
trong webview, khong dung titlebar mac dinh cua OS. Titlebar rieng (trong
suot, chi 3 nut minimize/maximize/close + vung keo cua so) duoc nhung vao
binary luc bien dich va tiem vao trang bang `initialization_script`, hoan
toan tach biet voi code cua evowars.io.

Kien truc nay dua tren pattern da dung o `pydinary` (xem
`src-tauri/src/main.rs` — cung ky thuat `include_str!` + injection, chi
doi domain va bo phan clone/patch source luc build).

## Truoc khi chay lan dau

1. **Logo**: dat file PNG vuong (nen 1024x1024, co alpha) vao
   `img/asrum.png`. `npm run gen-icons` se tu sinh cac icon Windows can
   thiet vao `src-tauri/icons/` tu file nay (tu dong chay truoc moi lan
   `tauri dev`/`tauri build`).

2. **Cai dependencies**:
   ```
   npm install
   ```

3. **Cai Rust + Tauri CLI** neu chua co: xem
   https://tauri.app/start/prerequisites/

## Chay dev

```
npm run tauri dev
```

## Build ban release

```
npm run tauri build
```

Ra file cai o `src-tauri/target/release/bundle/` (msi + nsis theo cau hinh
hien tai trong `tauri.conf.json`).

## Bat auto-update (bat buoc phai lam truoc khi phat hanh)

App da cau hinh san `tauri-plugin-updater`, nhung **chua co key that** —
neu chay build ngay bay gio, buoc `createUpdaterArtifacts` se loi vi
`pubkey` trong `tauri.conf.json` con la placeholder.

1. Sinh cap key (chi lam 1 lan, giu file `.key` that ky ca doi, KHONG
   commit vao git):
   ```
   npx tauri signer generate -w ~/.tauri/asrum-launcher.key
   ```
2. Lenh tren in ra **public key** — dan vao `plugins.updater.pubkey` trong
   `src-tauri/tauri.conf.json` (thay cho dong placeholder).
3. Khi build release that, set 2 bien moi truong tro toi private key de
   Tauri tu ky artifact cap nhat:
   ```
   TAURI_SIGNING_PRIVATE_KEY=~/.tauri/asrum-launcher.key
   TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<mat khau ban dat luc generate>
   ```
4. Endpoint cap nhat dang tro ve
   `https://github.com/vinhdubaii/asrum-launcher/releases/latest/download/latest.json`
   — nghia la ban can co repo GitHub ten `asrum-launcher` va publish
   release kem file `latest.json` (lenh `tauri build` tu sinh file nay
   khi `createUpdaterArtifacts: true`, chi can upload len GitHub Release).
   Doi lai neu ten repo/username khac.

## Build + release tu dong bang GitHub Actions

Workflow `.github/workflows/release.yml` tu build va tao GitHub Release
moi khi push 1 tag dang `v*.*.*`:

```
git tag v0.1.0
git push origin v0.1.0
```

Workflow se:
1. Build ban Windows (msi + nsis) tren `windows-latest`.
2. Tao 1 GitHub Release o dang **Draft** kem `latest.json` + chu ky (de
   `check_for_update()` trong app biet co ban moi — no chi thay release da
   Publish, bo qua Draft, nen ban con co co hoi kiem tra lai truoc khi
   nguoi dung nhan duoc).
3. Copy rieng 1 ban file nsis (ten goc kem version, vd
   `Asrum Launcher_0.1.0_x64-setup.exe`) thanh **`asrum-setup-latest.exe`**
   va upload them vao release do — dung lam link tai truc tiep, khong doi
   ten qua tung phien ban.
4. Sau khi kiem tra ban Draft on, vao GitHub Releases bam **Publish** thu
   cong — luc do auto-update trong app moi bat dau thay ban nay.

**Bat buoc phai co truoc 2 secret** trong repo (Settings → Secrets and
variables → Actions), lay tu buoc `tauri signer generate` o phan tren:
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Va nho commit `img/asrum.png` vao repo — workflow chay `gen-icons` ngay
trong buoc build (qua `beforeBuildCommand`), thieu file nay se build loi.

## Cau truc thu muc

```
asrum-launcher/
├── .github/workflows/release.yml  ← build + tao Release khi push tag
├── img/asrum.png             ← logo (ban tu them vao)
├── scripts/gen-icons.mjs     ← tu sinh icon tu img/asrum.png
├── titlebar/                 ← markup + CSS + JS cua titlebar rieng
│   ├── titlebar.html
│   ├── titlebar.css
│   └── titlebar.js
└── src-tauri/
    ├── tauri.conf.json       ← window url = evowars.io, decorations:false
    ├── capabilities/default.json  ← quyen window + remote.urls cho evowars.io
    └── src/main.rs           ← nhung titlebar vao binary + tiem vao trang
```

## Ghi chu ve resizable + double-click maximize

Cua so dat `resizable: true` nhung `minWidth`/`minHeight` bang dung
`width`/`height` mac dinh (1280x800) — nhin nhu cua so co kich thuoc co
dinh luc moi mo, nhung nguoi dung van resize/maximize duoc binh thuong,
va double-click vao vung trong cua titlebar (`titlebar.js`) van toggle
maximize dung nhu mong doi.
