// ช่องคอมเมนต์ท้ายหน้าอ่าน (Firestore) — ต้องล็อกอินจึงจะโพสต์ได้
(function () {
    const params = new URLSearchParams(location.search);
    const comic = params.get("title") ? getComic(params.get("title")) : null;
    const main = document.querySelector(".reader-main");
    if (!comic || !main) return;
    const nums = chapterNumbers(comic);
    const req = parseInt(params.get("chapter"), 10);
    const chapter = nums.includes(req) ? req : nums[0];
    if (chapter == null) return;

    const sec = document.createElement("section");
    sec.className = "comments";
    sec.innerHTML = `<h2>💬 ความคิดเห็น <span id="cCount"></span></h2>
        <div id="cForm"></div><div id="cList"><p class="empty-note">กำลังโหลด...</p></div>`;
    main.appendChild(sec);
    const $ = id => document.getElementById(id);

    const unavailable = () => {
        $("cForm").innerHTML = "";
        $("cList").innerHTML = `<p class="empty-note">ระบบคอมเมนต์ยังไม่พร้อมใช้งาน (ตรวจสอบการตั้งค่า Firebase)</p>`;
    };
    if (window.ZM_FAILED) return unavailable();
    document.addEventListener("zm-failed", unavailable, { once: true });
    if (window.ZM) start(window.ZM);
    else document.addEventListener("zm-ready", () => start(window.ZM), { once: true });

    function start({ auth, db }) {
        const col = db.collection("comments").doc(`${comic.id}_${chapter}`).collection("items");
        let user = auth.currentUser, items = [], lastSend = 0;

        const avatar = (url, name) => url
            ? `<img class="c-avatar" src="${esc(url)}" alt="" referrerpolicy="no-referrer">`
            : `<span class="c-avatar c-ph">${esc((name || "?").charAt(0))}</span>`;

        function ago(ms) {
            const m = Math.floor((Date.now() - ms) / 60000);
            if (m < 1) return "เมื่อสักครู่";
            if (m < 60) return `${m} นาทีที่แล้ว`;
            if (m < 1440) return `${Math.floor(m / 60)} ชั่วโมงที่แล้ว`;
            if (m < 43200) return `${Math.floor(m / 1440)} วันที่แล้ว`;
            return new Date(ms).toLocaleDateString("th-TH");
        }

        function renderForm() {
            if (!user) {
                $("cForm").innerHTML = `<div class="c-login"><span>เข้าสู่ระบบเพื่อแสดงความคิดเห็น</span>
                    <button type="button" id="cLogin" class="c-btn">Sign in with Google</button></div>`;
                $("cLogin").onclick = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                    .catch(e => alert("เข้าสู่ระบบไม่สำเร็จ: " + e.message));
                return;
            }
            $("cForm").innerHTML = `<div class="c-form">${avatar(user.photoURL, user.displayName)}
                <div class="c-box"><textarea id="cText" maxlength="500" rows="3" placeholder="แสดงความคิดเห็นเกี่ยวกับตอนนี้..."></textarea>
                <div class="c-actions"><span id="cLeft">500</span><button type="button" id="cSend" class="c-btn">ส่งความคิดเห็น</button></div></div></div>`;
            const ta = $("cText");
            ta.addEventListener("input", () => { $("cLeft").textContent = 500 - ta.value.length; });
            $("cSend").onclick = async () => {
                const text = ta.value.trim();
                if (!text) return;
                if (Date.now() - lastSend < 5000) return alert("รอสักครู่ก่อนส่งความคิดเห็นถัดไป");
                lastSend = Date.now();
                try {
                    await col.add({
                        uid: user.uid, name: user.displayName || "ผู้ใช้", photo: user.photoURL || "",
                        text, t: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                    ta.value = ""; $("cLeft").textContent = 500;
                } catch (e) { alert("ส่งไม่สำเร็จ: " + e.message); }
            };
        }

        function renderList() {
            $("cCount").textContent = items.length ? `(${items.length})` : "";
            $("cList").innerHTML = items.length ? items.map(c => `
                <div class="c-item">${avatar(c.photo, c.name)}
                  <div class="c-body">
                    <div class="c-meta"><strong>${esc(c.name)}</strong><span>${ago(c.ms)}</span>
                      ${user && user.uid === c.uid ? `<button type="button" class="c-del" data-id="${c.id}">ลบ</button>` : ""}</div>
                    <p>${esc(c.text)}</p>
                  </div></div>`).join("")
                : `<p class="empty-note">ยังไม่มีความคิดเห็น มาเป็นคนแรกได้เลย</p>`;
        }

        $("cList").addEventListener("click", e => {
            const b = e.target.closest(".c-del");
            if (b && confirm("ลบความคิดเห็นนี้?")) col.doc(b.dataset.id).delete().catch(err => alert("ลบไม่สำเร็จ: " + err.message));
        });

        col.orderBy("t", "desc").limit(50).onSnapshot(snap => {
            items = snap.docs.map(d => {
                const v = d.data();
                return { id: d.id, uid: v.uid, name: v.name, photo: v.photo, text: v.text, ms: v.t ? v.t.toMillis() : Date.now() };
            });
            renderList();
        }, err => {
            $("cList").innerHTML = `<p class="empty-note">โหลดความคิดเห็นไม่สำเร็จ: ${esc(err.message)}</p>`;
        });

        auth.onAuthStateChanged(u => { user = u; renderForm(); renderList(); });
    }
})();