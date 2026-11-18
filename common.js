// ระบบกลางทุกหน้า: โหมดกลางวัน/กลางคืน (ธีมถูกตั้งใน <head> แล้วเพื่อไม่ให้หน้ากะพริบ)
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const btn = document.getElementById("toggleMode");
    if (!btn) return;
    const label = () => {
        btn.textContent = root.classList.contains("light-mode") ? "🌙 โหมดกลางคืน" : "☀️ โหมดกลางวัน";
    };
    label();
    btn.addEventListener("click", () => {
        const isLight = root.classList.toggle("light-mode");
        try { localStorage.setItem("theme", isLight ? "light" : "dark"); } catch (e) {}
        label();
    });
});

// ===== แถบเมนูด้านซ้าย (Sidebar) — ฉีดเข้าทุกหน้าจากที่นี่ที่เดียว =====
document.addEventListener("DOMContentLoaded", () => {
    const page = location.pathname.split("/").pop() || "index.html";
    const isHome = page === "index.html" && !location.hash;

    // [ไอคอน, ชื่อ, ลิงก์ (null = ยังไม่เปิดใช้)]
    const main = [
        ["🏠", "Home", "index.html"],
        ["🔭", "Explore", "all.html"],
        ["📡", "Post", null],
        ["✨", "AI Project", null],
    ];
    const mySpace = [["👤", "Profile", null], ["🔖", "My Library", "my.html?tab=library"], ["📥", "Inbox", null], ["🕘", "History", "my.html?tab=history"]];
    const tab = new URLSearchParams(location.search).get("tab") || "library";

    const mainHTML = main.map(([ic, label, href]) => href
        ? `<a class="side-item${(label === "Home" && isHome) || (label === "Explore" && page === "all.html") ? " active" : ""}" href="${href}"><span>${ic}</span>${label}</a>`
        : `<span class="side-item disabled" aria-disabled="true" title="เร็ว ๆ นี้"><span>${ic}</span>${label}</span>`
    ).join("");
    const spaceHTML = mySpace.map(([ic, label, href]) => href
        ? `<a class="side-item${page === "my.html" && href.endsWith(tab) ? " active" : ""}" href="${href}"><span>${ic}</span>${label}</a>`
        : `<span class="side-item disabled" aria-disabled="true" title="เร็ว ๆ นี้"><span>${ic}</span>${label}</span>`
    ).join("");

    const google = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>`;

    document.body.insertAdjacentHTML("afterbegin", `
      <aside class="sidebar" aria-label="เมนูหลัก">
        <a class="logo" href="index.html"><img src="logo.png" alt="" class="logo-img" height="32" style="height:32px;width:auto"> Zero-Manga</a>
        ${mainHTML}
        <hr class="side-divider">
        <button class="google-btn" id="googleSignIn" type="button">${google} Sign in with Google</button>
        <p class="side-label">MY SPACE</p>
        ${spaceHTML}
      </aside>
      <div class="side-backdrop" id="sideBackdrop"></div>`);
    document.body.classList.add("has-sidebar");

    // ปุ่มเมนู ☰ สำหรับมือถือ
    const right = document.querySelector("header .header-right");
    if (right) {
        const mb = document.createElement("button");
        mb.className = "menu-btn"; mb.type = "button"; mb.textContent = "☰"; mb.setAttribute("aria-label", "เปิดเมนู");
        right.prepend(mb);
        mb.addEventListener("click", () => document.body.classList.toggle("side-open"));
    }
    document.getElementById("sideBackdrop").addEventListener("click", () => document.body.classList.remove("side-open"));
    document.addEventListener("keydown", e => { if (e.key === "Escape") document.body.classList.remove("side-open"); });

});

// ===== ที่เก็บข้อมูลในเครื่อง (My Library / History) =====
const Store = {
    read(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } },
    write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
function addHistory(id, chapter) {
    const h = Store.read("history").filter(x => x.id !== id);
    h.unshift({ id, chapter, t: Date.now() });
    Store.write("history", h.slice(0, 30));
}
function inLibrary(id) { return Store.read("library").includes(id); }
function toggleLibrary(id) {
    let l = Store.read("library");
    const has = l.includes(id);
    l = has ? l.filter(x => x !== id) : [id, ...l];
    Store.write("library", l);
    return !has;
}

// ===== โหลดระบบล็อกอิน =====
(() => { const s = document.createElement("script"); s.src = "auth.js"; document.head.appendChild(s); })();