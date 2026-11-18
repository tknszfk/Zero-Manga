const title = new URLSearchParams(location.search).get("title");
const comic = title ? getComic(title) : null;

if (!comic) {
    document.getElementById("detailRoot").innerHTML = `
        <h2 class="not-found">❌ ไม่พบข้อมูลเรื่องนี้<br><br><a href="index.html">กลับหน้าหลัก</a></h2>`;
} else {
    document.title = `${comic.name} - Zero-Manga`;
    const cover = document.getElementById("comicCover");
    cover.src = comic.cover;
    cover.alt = `ปก ${comic.name}`;
    document.getElementById("comicTitle").textContent = comic.name;
    document.getElementById("comicSynopsis").textContent = comic.synopsis;
    document.getElementById("comicRating").textContent = comic.rating;
    document.getElementById("comicStatus").textContent = comic.status;
    document.getElementById("comicType").textContent = comic.type;
    document.getElementById("comicGenres").innerHTML =
        comic.genres.map(g => `<span class="genre-tag">${esc(g)}</span>`).join(" ");

    const nums = chapterNumbers(comic);
    const readFirst = document.getElementById("readFirst");
    const readLatest = document.getElementById("readLatest");
    const chapterList = document.getElementById("chapterList");
    const readUrl = n => `reader.html?title=${encodeURIComponent(comic.id)}&chapter=${n}`;

    if (nums.length === 0) {
        [readFirst, readLatest].forEach(b => { b.classList.add("disabled"); b.removeAttribute("href"); });
        chapterList.innerHTML = `<p class="empty-note">ยังไม่มีตอนให้อ่าน</p>`;
    } else {
        const first = nums[0], last = nums[nums.length - 1];
        readFirst.textContent = `อ่านตอนที่ ${first}`;
        readFirst.href = readUrl(first);
        readLatest.textContent = `อ่านตอนที่ ${last}`;
        readLatest.href = readUrl(last);
        chapterList.innerHTML = [...nums].reverse()
            .map(n => `<a class="chapter-item" href="${readUrl(n)}">ตอนที่ ${n}</a>`).join("");
    }
}

// 🔖 ปุ่มเพิ่ม/นำออกจากคลัง
if (comic) {
    const libBtn = document.createElement("button");
    libBtn.type = "button";
    libBtn.className = "read-btn secondary";
    const paint = () => {
        const on = inLibrary(comic.id);
        libBtn.textContent = on ? "✅ อยู่ในคลังแล้ว" : "🔖 เพิ่มลงคลัง";
        libBtn.classList.toggle("on", on);
    };
    paint();
    libBtn.addEventListener("click", () => { toggleLibrary(comic.id); paint(); });
    document.querySelector(".read-buttons").appendChild(libBtn);
}