const params = new URLSearchParams(location.search);
const title = params.get("title");
const comic = title ? getComic(title) : null;

const titleEl = document.getElementById("comicTitle");
const container = document.getElementById("readerContainer");
const selects = [document.getElementById("chapterSelect"), document.getElementById("chapterSelectBottom")];
const prevBtns = [document.getElementById("prevChapter"), document.getElementById("prevChapterBottom")];
const nextBtns = [document.getElementById("nextChapter"), document.getElementById("nextChapterBottom")];

function goTo(n) {
    location.href = `reader.html?title=${encodeURIComponent(title)}&chapter=${n}`;
}

if (!comic) {
    titleEl.textContent = "❌ ไม่พบข้อมูลเรื่องนี้";
    container.innerHTML = `<p><a href="index.html">กลับหน้าหลัก</a></p>`;
    document.querySelectorAll(".reader-controls").forEach(el => el.style.display = "none");
} else {
    const nums = chapterNumbers(comic);
    const requested = parseInt(params.get("chapter"), 10);
    const chapter = nums.includes(requested) ? requested : nums[0];
    const idx = nums.indexOf(chapter);
    const pages = comic.chapters[chapter];

    document.title = `${comic.name} ตอนที่ ${chapter} - Comic FF`;
    addHistory(comic.id, chapter);
    titleEl.textContent = `${comic.name} - ตอนที่ ${chapter}`;

    if (pages && pages.length) {
        pages.forEach((src, i) => {
            const img = new Image();
            img.referrerPolicy = "no-referrer";
            img.loading = i < 2 ? "eager" : "lazy";
            img.alt = `${comic.name} ตอน ${chapter} หน้า ${i + 1}`;
            img.onload = () => img.classList.add("loaded");
            img.onerror = () => { img.alt = "โหลดภาพไม่สำเร็จ"; img.classList.add("loaded"); };
            img.src = src;
            container.appendChild(img);
        });
    } else {
        container.innerHTML = "<p style='text-align:center'>❌ ยังไม่มีภาพในตอนนี้</p>";
    }

    selects.forEach(sel => {
        sel.innerHTML = nums.map(n => `<option value="${n}"${n === chapter ? " selected" : ""}>ตอนที่ ${n}</option>`).join("");
        sel.addEventListener("change", e => goTo(e.target.value));
    });
    prevBtns.forEach(b => { b.disabled = idx <= 0; b.addEventListener("click", () => goTo(nums[idx - 1])); });
    nextBtns.forEach(b => { b.disabled = idx >= nums.length - 1; b.addEventListener("click", () => goTo(nums[idx + 1])); });
}

// ⬆ ปุ่มกลับขึ้นบน
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
}, { passive: true });
scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
