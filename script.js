const detailUrl = id => `detail.html?title=${encodeURIComponent(id)}`;

function cardHTML(c, sub) {
    return `<a class="card-link" href="${detailUrl(c.id)}">
      <div class="card">
        <img src="${esc(c.cover)}" alt="${esc(c.name)}" loading="lazy" referrerpolicy="no-referrer">
        <div class="card-info"><h3>${esc(c.name)}</h3><p>${esc(sub)}</p></div>
      </div></a>`;
}

// 🔥 ตอนอัปเดตล่าสุด
document.getElementById("latestComics").innerHTML = COMIC_LIST
    .map(c => cardHTML(c, latestChapter(c) > 0 ? `ตอนที่ ${latestChapter(c)}` : "เร็ว ๆ นี้"))
    .join("");

// ⭐ ยอดนิยม
document.getElementById("popularComics").innerHTML = COMIC_LIST
    .filter(c => POPULAR_IDS.includes(c.id))
    .map(c => cardHTML(c, "กำลังมาแรง"))
    .join("");

// 🔍 ค้นหา
const searchInput = document.getElementById("searchInput");
const box = document.getElementById("search-suggestions");

function closeBox() { box.style.display = "none"; }

searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return closeBox();
    const matches = COMIC_LIST.filter(c => c.name.toLowerCase().includes(q));
    box.innerHTML = matches.length
        ? matches.map(c => `<a class="suggestion-item" href="${detailUrl(c.id)}">
              <img src="${esc(c.cover)}" alt="" referrerpolicy="no-referrer"><span>${esc(c.name)}</span></a>`).join("")
        : `<div class="no-result">ไม่พบการ์ตูนที่ค้นหา</div>`;
    box.style.display = "block";
});
searchInput.addEventListener("keydown", e => { if (e.key === "Escape") closeBox(); });
document.addEventListener("click", e => { if (!e.target.closest(".search-box")) closeBox(); });
