// ================== KIỂM TRA TRẠNG THÁI NGƯỜI DÙNG ================== //
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const session = JSON.parse(localStorage.getItem("user_session"));

  if (session && session.user) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    console.log("Đăng nhập:", session.user.email);
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user_session");
    alert("Đã đăng xuất!");
    window.location.href = "login.html";
  });
});
const container = document.getElementById("newsContainer");

async function loadNews() {
  try {
    // API này miễn phí, không cần key, có CORS
    const res = await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=50");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("No articles found");
    }

    container.innerHTML = "";
    data.results.forEach(article => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <img src="${article.image_url || 'https://via.placeholder.com/300x180?text=No+Image'}" alt="">
        <h3>${article.title}</h3>
        <p>${article.summary || "No description available."}</p>
        <a href="${article.url}" target="_blank" class="btn">Đọc thêm →</a>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>❌ Lỗi tải tin tức. Vui lòng thử lại sau.</p>";
  }
}

loadNews();
