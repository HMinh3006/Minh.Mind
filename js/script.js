// scripts.js
import {
  addWordToFirestore,
  loadWordsFromFirestore,
  updateWord,
  deleteWord,
} from "./crud.js";

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

// ================== API TRA TỪ ================== //
async function fetchWord(word) {
  if (!word || !word.trim()) {
    alert("Vui lòng nhập từ cần tra!");
    return null;
  }
    try {
      const backupRes = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word.trim())}`);
      const suggestions = await backupRes.json();
      if (!suggestions.length) throw new Error("Không tìm thấy từ tương tự.");
      return {
        word,
        phonetic: "",
        audio: "",
        meanings: [
          {
            partOfSpeech: "similar words",
            definition: "Các từ gần nghĩa hoặc liên quan:",
            example: suggestions.slice(0, 10).map(s => s.word).join(", ")
          }
        ]
      };
    } catch (backupError) {
      console.error("Lỗi tra từ (Datamuse):", backupError);
      alert("Không thể tra từ ở thời điểm này.");
      return null;
    }
  }

// ================== API DỊCH TIẾNG VIỆT ================== //
async function translateToVietnamese(text) {
  
    try {
      const backup = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
      const data2 = await backup.json();
      return data2.responseData.translatedText || "Không dịch được.";
    } catch (backupError) {
      console.error("Lỗi dịch (MyMemory):", backupError);
      return "Không dịch được.";
    }
  }


// ================== TRA TỪ & LƯU FIRESTORE ================== //
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const wordInput = document.getElementById("wordInput").value.trim();
    const resultBox = document.getElementById("resultBox");
    if (!wordInput) return alert("Vui lòng nhập từ cần tra!");

    resultBox.innerHTML = "<p>Đang tra từ...</p>";
    const wordData = await fetchWord(wordInput);
    if (!wordData) return;

    // Render nội dung
    let meaningsHTML = "";
    wordData.meanings.forEach((m) => {
      meaningsHTML += `<h4>${m.partOfSpeech}</h4>`;
      meaningsHTML += `<p>${m.definition}</p>`;
      if (m.example) meaningsHTML += `<em>Ví dụ: ${m.example}</em>`;
    });

    const vietnamese = await translateToVietnamese(wordInput);
    resultBox.innerHTML = `
      <h2>${wordData.word}</h2>
      <p><strong>Phiên âm:</strong> ${wordData.phonetic || ""}</p>
      <div>${meaningsHTML}</div>
      <p><strong>Nghĩa tiếng Việt:</strong> ${vietnamese}</p>
    `;

    // Nếu có đăng nhập -> cho phép lưu Firestore
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (session && session.user) {
      resultBox.innerHTML += `<button id="saveBtn" class="btn">Lưu từ</button>`;
      const saveBtn = document.getElementById("saveBtn");
      saveBtn.addEventListener("click", async () => {
        await addWordToFirestore(wordData.word, meaningsHTML, vietnamese, session.user.email);
      });
    } else {
      resultBox.innerHTML += `<p style="color:red;">🔒 Đăng nhập để lưu từ này</p>`;
    }
  });
}

// ================== TẢI DANH SÁCH FIRESTORE (THEO USER) ================== //
const session = JSON.parse(localStorage.getItem("user_session"));
if (session && session.user) {
  loadWordsFromFirestore(session.user.email, "savedList");
}

// ================== CẬP NHẬT & XOÁ ================== //
window.updateWord = async function (id, oldWord) {
  const newWord = prompt("Nhập lại từ:", oldWord);
  if (!newWord) return;
  await updateWord(id, newWord);
};

window.deleteWord = async function (id) {
  if (!confirm("Xoá từ này?")) return;
  await deleteWord(id);
};
