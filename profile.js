// หน้าโปรไฟล์: แก้ชื่อที่แสดง + bio เก็บใน Firestore (users/{uid}.profile)
(function () {
    const root = document.getElementById("profileRoot");

    const unavailable = () => {
        root.innerHTML = `<p class="empty-note">ระบบโปรไฟล์ยังไม่พร้อมใช้งาน (ตรวจสอบการตั้งค่า Firebase)</p>`;
    };
    if (window.ZM_FAILED) return unavailable();
    document.addEventListener("zm-failed", unavailable, { once: true });
    if (window.ZM) start(window.ZM);
    else document.addEventListener("zm-ready", () => start(window.ZM), { once: true });

    function start({ auth, db }) {
        auth.onAuthStateChanged(user => (user ? renderProfile(user) : renderLogin()));

        function renderLogin() {
            root.innerHTML = `<div class="p-card p-login">
                <h2>โปรไฟล์ของฉัน</h2>
                <p>เข้าสู่ระบบเพื่อดูและแก้ไขโปรไฟล์</p>
                <button type="button" id="pLogin" class="c-btn">Sign in with Google</button></div>`;
            document.getElementById("pLogin").onclick = () =>
                auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                    .catch(e => alert("เข้าสู่ระบบไม่สำเร็จ: " + e.message));
        }

        async function renderProfile(user) {
            let saved = {};
            try {
                const snap = await db.collection("users").doc(user.uid).get();
                saved = (snap.exists && snap.data().profile) || {};
            } catch (e) { /* ใช้ค่าเริ่มต้นจากบัญชี Google */ }

            const name = saved.displayName || user.displayName || "ผู้ใช้";
            const bio = saved.bio || "";
            const joined = user.metadata && user.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString("th-TH") : "-";
            const avatar = user.photoURL
                ? `<img class="p-avatar" src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">`
                : `<span class="p-avatar p-ph">${esc(name.charAt(0))}</span>`;

            root.innerHTML = `<div class="p-card">
                <div class="p-head">${avatar}
                    <div><h2 id="pTitle">${esc(name)}</h2>
                    <p class="p-sub">${esc(user.email || "")}</p>
                    <p class="p-sub">เป็นสมาชิกตั้งแต่ ${esc(joined)}</p></div></div>
                <div class="p-stats">
                    <div><strong>${Store.read("library").length}</strong><span>ในคลัง</span></div>
                    <div><strong>${Store.read("history").length}</strong><span>ประวัติการอ่าน</span></div>
                </div>
                <label class="p-field">ชื่อที่แสดง
                    <input id="pName" type="text" maxlength="30" value="${esc(name)}"></label>
                <label class="p-field">แนะนำตัว
                    <textarea id="pBio" maxlength="200" rows="4" placeholder="เล่าเกี่ยวกับตัวคุณสั้น ๆ">${esc(bio)}</textarea>
                    <span class="p-count"><span id="pLeft">${200 - bio.length}</span>/200</span></label>
                <div class="p-actions">
                    <button type="button" id="pSave" class="c-btn">บันทึกโปรไฟล์</button>
                    <button type="button" id="pOut" class="clear-btn" style="margin-left:0">ออกจากระบบ</button>
                    <span id="pMsg" class="p-msg" role="status"></span>
                </div></div>`;

            const $ = id => document.getElementById(id);
            $("pBio").addEventListener("input", () => { $("pLeft").textContent = 200 - $("pBio").value.length; });
            $("pOut").onclick = () => auth.signOut();
            $("pSave").onclick = async () => {
                const displayName = $("pName").value.trim();
                const bioText = $("pBio").value.trim();
                const msg = $("pMsg");
                if (!displayName) { msg.textContent = "กรุณากรอกชื่อที่แสดง"; return; }
                $("pSave").disabled = true; msg.textContent = "กำลังบันทึก...";
                try {
                    await user.updateProfile({ displayName });
                    await db.collection("users").doc(user.uid)
                        .set({ profile: { displayName, bio: bioText } }, { merge: true });
                    $("pTitle").textContent = displayName;
                    const sb = document.querySelector("#userBox strong");
                    if (sb) sb.textContent = displayName;
                    msg.textContent = "บันทึกโปรไฟล์แล้ว";
                } catch (e) {
                    msg.textContent = "บันทึกไม่สำเร็จ: " + e.message;
                }
                $("pSave").disabled = false;
            };
        }
    }
})();