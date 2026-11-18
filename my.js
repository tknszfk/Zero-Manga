const tab = new URLSearchParams(location.search).get("tab") === "history" ? "history" : "library";
document.getElementById(tab === "history" ? "tabHistory" : "tabLibrary").classList.add("active");
document.title = (tab === "history" ? "History" : "My Library") + " - Comic FF";

const list = document.getElementById("myList");
const clearBtn = document.getElementById("clearBtn");

function myCard(href, c, sub) {
    return `<a class="card-link" href="${href}"><div class="card">
        <img src="${esc(c.cover)}" alt="${esc(c.name)}" loading="lazy" referrerpolicy="no-referrer">
        <div class="card-info"><h3>${esc(c.name)}</h3><p>${esc(sub)}</p></div></div></a>`;
}

function render() {
    let cards = [];
    if (tab === "library") {
        cards = Store.read("library").map(getComic).filter(Boolean)
            .map(c => myCard(`detail.html?title=${encodeURIComponent(c.id)}`, c,
                latestChapter(c) > 0 ? `ตอนที่ ${latestChapter(c)}` : "เร็ว ๆ นี้"));
    } else {
        cards = Store.read("history").map(h => ({ c: getComic(h.id), h })).filter(x => x.c)
            .map(({ c, h }) => myCard(`reader.html?title=${encodeURIComponent(c.id)}&chapter=${h.chapter}`, c,
                `อ่านต่อ ตอนที่ ${h.chapter}`));
        clearBtn.hidden = cards.length === 0;
    }
    list.innerHTML = cards.join("") || `<p class="empty-note">${tab === "history"
        ? "ยังไม่มีประวัติการอ่าน" : "ยังไม่มีการ์ตูนในคลัง กดปุ่ม “เพิ่มลงคลัง” ในหน้าเรื่อง"}
        <a href="index.html" style="text-decoration:underline">ไปเลือกอ่านการ์ตูน</a></p>`;
}

clearBtn.addEventListener("click", () => {
    if (confirm("ล้างประวัติการอ่านทั้งหมด?")) { Store.write("history", []); render(); }
});
render();