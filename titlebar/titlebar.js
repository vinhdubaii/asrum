// titlebar.js — duoc main.rs nhung vao evowars.io qua initialization_script.
// Hoan toan doc lap voi logic cua trang goc, chi thao tac tren cac phan tu
// #app-titlebar do titlebar.html tao ra.
//
// Dung window.__TAURI__ (bat qua "app.withGlobalTauri": true trong
// tauri.conf.json) thay vi cau lenh "import", vi trang nay khong co buoc
// bundle nao ca — script duoc nap thang nhu 1 <script> tinh.

(function () {
  const tauriWindow = window.__TAURI__ && window.__TAURI__.window;
  if (!tauriWindow) {
    console.warn("[titlebar] window.__TAURI__.window khong ton tai — " +
      "kiem tra lai app.withGlobalTauri trong tauri.conf.json.");
    return;
  }

  const appWindow = tauriWindow.getCurrentWindow();

  function bind(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
  }

  bind("titlebar-min", () => appWindow.minimize());
  bind("titlebar-max", () => appWindow.toggleMaximize());
  bind("titlebar-close", () => appWindow.close());

  // Double-click vao vung keo = phong to/thu nho, giong titlebar Windows
  // chuan. Luu y: chi co tac dung neu cua so dat resizable:true — voi cua
  // so resizable:false, OS se khong cho maximize nen click nay se khong
  // lam gi (khong loi, chi khong hien ro tac dung).
  const spacer = document.querySelector(".app-titlebar-spacer");
  if (spacer) {
    spacer.addEventListener("dblclick", () => appWindow.toggleMaximize());
  }

  // --- Fullscreen (F11 / Esc) ---
  // Day la fullscreen THAT cua he dieu hanh (Tauri setFullscreen — cua so
  // phu kin man hinh, khong vien). F11 = bat/tat (toggle). Esc = chi thoat
  // (khong bao gio bat), giong convention pham vi trinh duyet.
  function setFullscreenClass(isFullscreen) {
    document.body.classList.toggle("app-is-fullscreen", isFullscreen);
  }

  async function toggleFullscreen() {
    const isFullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFullscreen);
    setFullscreenClass(!isFullscreen);
  }

  async function exitFullscreenIfActive() {
    if (await appWindow.isFullscreen()) {
      await appWindow.setFullscreen(false);
      setFullscreenClass(false);
    }
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "F11") {
      // Chan hanh vi F11 mac dinh cua webview (Chromium tu bat fullscreen
      // kieu browser) de khong dung do voi Tauri fullscreen.
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key === "Escape") {
      exitFullscreenIfActive();
    }
  });

  // Dong bo lai class luc script vua nap, phong khi cua so da o san
  // fullscreen tu truoc.
  appWindow.isFullscreen().then(setFullscreenClass);
})();
