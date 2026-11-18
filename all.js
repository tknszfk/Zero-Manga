const genre = new URLSearchParams(location.search).get("genre");
const genres = [...new Set(COMIC_LIST.flatMap(c => c.genres))].sort();
const shown = genre ? COMIC_LIST.filter(c => c.genres.includes(genre)) : COMIC_LIST;

document.getElementById("genreChips").innerHTML =
    `<a href="all.html" class="${genre ? "" : "active"}">ทั้งหมด</a>` +
    genres.map(g => `<a href="all.html?genre=${encodeURIComponent(g)}" class="${g === genre ? "active" : ""}">${esc(g)}</a>`).join("");

document.getElementById("allTitle").textContent = `${genre || "มังงะทั้งหมด"} (${shown.length})`;
document.title = `${genre || "มังงะทั้งหมด"} - Comic FF`;

document.getElementById("allList").innerHTML = shown.map(c => `
    <a class="card-link" href="detail.html?title=${encodeURIComponent(c.id)}"><div class="card">
        <img src="${esc(c.cover)}" alt="${esc(c.name)}" loading="lazy" referrerpolicy="no-referrer">
        <div class="card-info"><h3>${esc(c.name)}</h3>
        <p>${latestChapter(c) > 0 ? "ตอนที่ " + latestChapter(c) : "เร็ว ๆ นี้"}</p></div></div></a>`).join("")
    || `<p class="empty-note">ไม่พบเรื่องในหมวดนี้</p>`;