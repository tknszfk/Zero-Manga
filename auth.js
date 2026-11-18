// ระบบล็อกอิน Google (Firebase Auth) + ซิงก์ My Library / History ผ่าน Firestore
(async () => {
    const load = src => new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = src; s.onload = res; s.onerror = () => rej(new Error(src));
        document.head.appendChild(s);
    });
    const CDN = "https://www.gstatic.com/firebasejs/10.12.2/";
    const btn = () => document.getElementById("googleSignIn");
    const setupError = msg => {
        window.ZM_FAILED = true; document.dispatchEvent(new Event("zm-failed"));
        const b = btn(); if (b) b.onclick = () => alert(msg);
    };

    if (document.readyState === "loading") await new Promise(r => document.addEventListener("DOMContentLoaded", r));

    try { await load("firebase-config.js"); } catch (e) { return setupError("ไม่พบไฟล์ firebase-config.js"); }
    if (typeof firebaseConfig === "undefined" || /YOUR_/.test(firebaseConfig.apiKey))
        return setupError("ยังไม่ได้ใส่ค่า Firebase ในไฟล์ firebase-config.js");
    try {
        await load(CDN + "firebase-app-compat.js");
        await load(CDN + "firebase-auth-compat.js");
        await load(CDN + "firebase-firestore-compat.js");
    } catch (e) { return setupError("โหลด Firebase ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต"); }

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    window.ZM = { auth, db };
    document.dispatchEvent(new Event("zm-ready"));
    const userDoc = uid => db.collection("users").doc(uid);

    // ทุกครั้งที่บันทึก library/history ให้ส่งขึ้นคลาวด์ด้วย (เมื่อล็อกอินอยู่)
    const origWrite = Store.write;
    Store.write = (k, v) => {
        origWrite(k, v);
        if (auth.currentUser && (k === "library" || k === "history"))
            userDoc(auth.currentUser.uid).set({ [k]: v }, { merge: true }).catch(() => {});
    };

    async function syncDown(user) {
        const snap = await userDoc(user.uid).get();
        const cloud = snap.exists ? snap.data() : {};
        const library = [...new Set([...Store.read("library"), ...(cloud.library || [])])];
        const byId = new Map();
        [...(cloud.history || []), ...Store.read("history")].forEach(h => {
            const old = byId.get(h.id);
            if (!old || h.t > old.t) byId.set(h.id, h);
        });
        const history = [...byId.values()].sort((a, b) => b.t - a.t).slice(0, 30);
        Store.write("library", library);
        Store.write("history", history);
        if (typeof render === "function" && location.pathname.endsWith("my.html")) render();
    }

    function paint(user) {
        const b = btn(); if (!b) return;
        document.getElementById("userBox")?.remove();
        if (!user) { b.style.display = ""; return; }
        b.style.display = "none";
        b.insertAdjacentHTML("afterend", `<div class="user-box" id="userBox">
            ${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ""}
            <div><strong>${esc(user.displayName || "ผู้ใช้")}</strong><br>
            <button type="button" id="signOutBtn" class="link-btn">ออกจากระบบ</button></div></div>`);
        document.getElementById("signOutBtn").onclick = () => auth.signOut();
    }

    btn().onclick = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch(e => alert("เข้าสู่ระบบไม่สำเร็จ: " + e.message));

    auth.onAuthStateChanged(user => {
        paint(user);
        if (user) syncDown(user).catch(e => console.warn("sync failed", e));
    });
})();