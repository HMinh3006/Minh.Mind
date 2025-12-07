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

// ================== API DỊCH ĐA NGÔN NGỮ ================== //
async function translateText(text, fromLang, toLang) {
  try {
    const langpair = `${fromLang}|${toLang}`;
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
    );
    const data = await res.json();
    return data.responseData.translatedText || "Không dịch được.";
  } catch (err) {
    console.error("Lỗi dịch (MyMemory):", err);
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

    //RESULT
    const sourceSelect = document.getElementById("sourceLang");
    const targetSelect = document.getElementById("targetLang");

    // fallback nếu không có select (cho đỡ lỗi)
    const fromLang = sourceSelect ? sourceSelect.value : "en";
    const toLang = targetSelect ? targetSelect.value : "vi";

    const translatedText = await translateText(wordInput, fromLang, toLang);

    // Lấy tên hiển thị (English, Vietnamese, ...)
    const fromLabel = sourceSelect
      ? sourceSelect.options[sourceSelect.selectedIndex].text
      : fromLang;
    const toLabel = targetSelect
      ? targetSelect.options[targetSelect.selectedIndex].text
      : toLang;

    resultBox.innerHTML = `
  <h2>${wordData.word}</h2>
  <p><strong>Phiên âm:</strong> ${wordData.phonetic || ""}</p>
  <div>${meaningsHTML}</div>
  <p><strong>Dịch (${fromLabel} → ${toLabel}):</strong> ${translatedText}</p>
`;


    // Nếu có đăng nhập -> cho phép lưu Firestore
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (session && session.user) {
      resultBox.innerHTML += `<button id="saveBtn" class="btn">Lưu từ</button>`;
      const saveBtn = document.getElementById("saveBtn");
      saveBtn.addEventListener("click", async () => {
        await addWordToFirestore(
          wordData.word,
          meaningsHTML,
          translatedText,      // vẫn truyền vào tham số "vietnamese" cũ
          session.user.email
        );

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
//dich chữ ở hình
const imageInput = document.getElementById("imageInput");
const ocrBtn = document.getElementById("ocrBtn");
const ocrResult = document.getElementById("ocrResult");
const wordInputEl = document.getElementById("wordInput"); // 

ocrBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Vui lòng chọn một hình ảnh trước");
    return;
  }

  ocrResult.innerHTML = "⏳ Đang nhận dạng chữ...";

  const { createWorker } = Tesseract;
  const worker = await createWorker("eng+vie"); // có thể thêm ngôn ngữ bạn cần

  const { data } = await worker.recognize(file);
  const text = data.text.trim();
  await worker.terminate();

  if (!text) {
    ocrResult.innerHTML = "Không nhận dạng được chữ.";
    return;
  }

  // 👉 Lấy dòng đầu tiên có chữ để đẩy vào ô tra từ
  const firstLine =
    text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0) || "";

  if (wordInputEl) {
    wordInputEl.value = firstLine;   // ⬅️ tự động đẩy text vào ô "Nhập từ cần tra"
    wordInputEl.focus();
  }

  ocrResult.innerHTML = `<p><strong>Text gốc:</strong></p><pre>${text}</pre>`;

  
});


