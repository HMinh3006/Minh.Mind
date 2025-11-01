// Đăng ký
function register() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!user || !pass) {
    document.getElementById("authMessage").textContent = "Vui lòng nhập đầy đủ!";
    return;
  }

  if (localStorage.getItem(`user-${user}`)) {
    document.getElementById("authMessage").textContent = "Tài khoản đã tồn tại!";
  } else {
    localStorage.setItem(`user-${user}`, pass);
    document.getElementById("authMessage").textContent = "Đăng ký thành công! Bạn có thể đăng nhập.";
  }
}

// Đăng nhập
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const storedPass = localStorage.getItem(`user-${user}`);

  if (storedPass && storedPass === pass) {
    localStorage.setItem("currentUser", user);
    document.getElementById("authSection").style.display = "none";
    document.getElementById("logoutSection").style.display = "flex";
    document.getElementById("userDisplay").textContent = user;

    enableWordButtons(true);
    loadWordList();
  } else {
    document.getElementById("authMessage").textContent = "Sai tài khoản hoặc mật khẩu!";
  }
}

// Đăng xuất
function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("authSection").style.display = "block";
  document.getElementById("logoutSection").style.display = "none";
  document.getElementById("userDisplay").textContent = "";
  enableWordButtons(false);
  document.getElementById("wordList").innerHTML = "";
}

// Khi vừa vào trang
window.onload = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("logoutSection").style.display = "flex";
    document.getElementById("userDisplay").textContent = currentUser;
    enableWordButtons(true);
    loadWordList();
  } else {
    enableWordButtons(false);
  }
};

// Kích hoạt / vô hiệu hóa nút
function enableWordButtons(enable) {
  document.getElementById("saveBtn").disabled = !enable;
  document.getElementById("updateBtn").disabled = !enable;
  document.getElementById("deleteBtn").disabled = !enable;
}

// Tra từ
async function searchWord() {
  const word = document.getElementById("wordInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Đang tra...";

  if (!word) {
    resultDiv.innerHTML = "Nhập từ cần tra.";
    return;
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    const definition = data[0].meanings[0].definitions[0].definition;
    const phonetic = data[0].phonetic || "";
    const example = data[0].meanings[0].definitions[0].example || "Không có ví dụ.";

    const translated = await translateToVietnamese(definition);

    resultDiv.innerHTML = `
      <p><strong>Từ:</strong> ${word}</p>
      <p><strong>Phát âm:</strong> ${phonetic}</p>
      <p><strong>Định nghĩa:</strong> ${definition}</p>
      <p><strong>Ví dụ:</strong> ${example}</p>
      <p><strong>Dịch nghĩa:</strong> ${translated}</p>
    `;
  } catch {
    resultDiv.innerHTML = "Không tìm thấy từ.";
  }
}

async function translateToVietnamese(text) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
  const data = await res.json();
  return data.responseData.translatedText;
}

// CRUD
function saveWord() {
  const word = document.getElementById("savedWord").value.trim();
  if (word) {
    let saved = JSON.parse(localStorage.getItem("myWords") || "[]");
    saved.push(word);
    localStorage.setItem("myWords", JSON.stringify(saved));
    loadWordList();
  }
}

function loadWordList() {
  const list = document.getElementById("wordList");
  const words = JSON.parse(localStorage.getItem("myWords") || "[]");
  list.innerHTML = "";
  words.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    list.appendChild(li);
  });
}

function updateWord() {
  const word = document.getElementById("savedWord").value.trim();
  let words = JSON.parse(localStorage.getItem("myWords") || "[]");
  if (words.length > 0 && word) {
    words[words.length - 1] = word;
    localStorage.setItem("myWords", JSON.stringify(words));
    loadWordList();
  }
}

function deleteWord() {
  const word = document.getElementById("savedWord").value.trim();
  let words = JSON.parse(localStorage.getItem("myWords") || "[]");
  words = words.filter(w => w !== word);
  localStorage.setItem("myWords", JSON.stringify(words));
  loadWordList();
}








document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-theme');
  const root = document.documentElement; // dùng html để áp dụng lên toàn trang
  if (!toggleBtn) {
    console.warn('toggle-theme button not found. Kiểm tra id của button.');
    return;
  }

  // Lấy theme từ localStorage hoặc theo prefers-color-scheme nếu chưa có
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ? saved : (prefersDark ? 'dark' : 'light');

  if (initial === 'dark') {
    root.classList.add('dark-mode');
    toggleBtn.textContent = '☀️';
  } else {
    root.classList.remove('dark-mode');
    toggleBtn.textContent = '🌙';
  }

  // Click để toggle
  toggleBtn.addEventListener('click', () => {
    const isDark = root.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
  });
});
