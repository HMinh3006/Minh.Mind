// ================== QUẢN LÝ NGƯỜI DÙNG ==================

// Đăng ký
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find((u) => u.username === username)) {
      alert("Tên đăng nhập đã tồn tại!");
      return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Đăng ký thành công! Mời bạn đăng nhập.");
    window.location.href = "login.html";
  });
}

// Đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", username);
      alert("Đăng nhập thành công!");
      window.location.href = "index.html";
    } else {
      alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
  });
}

// Đăng xuất
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    alert("Đã đăng xuất!");
    window.location.href = "login.html";
  });
}

// ================== KIỂM TRA TRẠNG THÁI NGƯỜI DÙNG ==================

const loginBtn = document.getElementById("loginBtn");
if (loginBtn && logoutBtn) {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
}

// ================== API TRA TỪ ==================

// Gọi API dictionaryapi.dev
async function fetchWord(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    if (!res.ok) throw new Error("Không tìm thấy từ!");
    const data = await res.json();
    return data[0];
  } catch (error) {
    alert("Lỗi tra từ: " + error.message);
    return null;
  }
}

// Gọi API LibreTranslate để dịch sang tiếng Việt
async function translateToVietnamese(text) {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: "vi",
        format: "text",
      }),
    });
    const data = await res.json();
    return data.translatedText;
  } catch {
    return "Không dịch được.";
  }
}

// ================== TRA TỪ & HIỂN THỊ ==================

const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const wordInput = document.getElementById("wordInput").value.trim();
    const resultBox = document.getElementById("resultBox");
    if (!wordInput) {
      alert("Vui lòng nhập từ cần tra!");
      return;
    }

    resultBox.innerHTML = "<p>Đang tra từ...</p>";
    const wordData = await fetchWord(wordInput);

    if (wordData) {
      let meaningsHTML = "";
      wordData.meanings.forEach((m) => {
        meaningsHTML += `<h4>${m.partOfSpeech}</h4>`;
        m.definitions.forEach((d, i) => {
          meaningsHTML += `<p>${i + 1}. ${d.definition}</p>`;
          if (d.example) meaningsHTML += `<em>Ví dụ: ${d.example}</em>`;
        });
      });

      const vietnamese = await translateToVietnamese(wordInput);

      // Hiển thị thông tin từ
      resultBox.innerHTML = `
        <h2>${wordData.word}</h2>
        <p><strong>Phiên âm:</strong> ${wordData.phonetics[0]?.text || ""}</p>
        <div>${meaningsHTML}</div>
        <p><strong>Nghĩa tiếng Việt:</strong> ${vietnamese}</p>
      `;

      // Kiểm tra đăng nhập để hiển thị nút lưu
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        resultBox.innerHTML += `<button id="saveBtn" class="btn">Lưu từ</button>`;

        const saveBtn = document.getElementById("saveBtn");
        saveBtn.addEventListener("click", () => {
          let savedWords =
            JSON.parse(localStorage.getItem("savedWords_" + currentUser)) || [];
          if (!savedWords.includes(wordData.word)) {
            savedWords.push(wordData.word);
            localStorage.setItem(
              "savedWords_" + currentUser,
              JSON.stringify(savedWords)
            );
            displaySavedWords();
            alert("Đã lưu từ!");
          } else {
            alert("Từ này đã được lưu trước đó!");
          }
        });
      } else {
        resultBox.innerHTML += `<p style="color:red; margin-top:10px;">🔒 Đăng nhập để lưu từ này</p>`;
      }
    }
  });
}

// ================== HIỂN THỊ TỪ ĐÃ LƯU ==================

function displaySavedWords() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  const savedList = document.getElementById("savedList");
  if (!savedList) return;

  let savedWords =
    JSON.parse(localStorage.getItem("savedWords_" + currentUser)) || [];

  savedList.innerHTML = "";
  savedWords.forEach((w, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${w}
      <button class="btn" onclick="deleteWord(${index})">Xóa</button>
    `;
    savedList.appendChild(li);
  });
}

function deleteWord(index) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  let savedWords =
    JSON.parse(localStorage.getItem("savedWords_" + currentUser)) || [];
  savedWords.splice(index, 1);
  localStorage.setItem("savedWords_" + currentUser, JSON.stringify(savedWords));
  displaySavedWords();
}

// Khi load trang index thì hiển thị danh sách từ đã lưu
if (document.getElementById("savedList")) {
  displaySavedWords();
}
