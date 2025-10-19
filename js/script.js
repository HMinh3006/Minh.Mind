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
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error("Không tìm thấy từ!");
    const data = await res.json();
    return data[0];
  } catch (error) {
    alert("Lỗi tra từ: " + error.message);
    return null;
  }
}

async function translateToVietnamese(text) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
    );
    const data = await res.json();
    return data.responseData.translatedText || "Không dịch được.";
  } catch {
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

    let meaningsHTML = "";
    wordData.meanings.forEach((m) => {
      meaningsHTML += `<h4>${m.partOfSpeech}</h4>`;
      m.definitions.forEach((d, i) => {
        meaningsHTML += `<p>${i + 1}. ${d.definition}</p>`;
        if (d.example) meaningsHTML += `<em>Ví dụ: ${d.example}</em>`;
      });
    });

    const vietnamese = await translateToVietnamese(wordInput);
    resultBox.innerHTML = `
      <h2>${wordData.word}</h2>
      <p><strong>Phiên âm:</strong> ${wordData.phonetics[0]?.text || ""}</p>
      <div>${meaningsHTML}</div>
      <p><strong>Nghĩa tiếng Việt:</strong> ${vietnamese}</p>
    `;

    const session = JSON.parse(localStorage.getItem("user_session"));
    if (session && session.user) {
      resultBox.innerHTML += `<button id="saveBtn" class="btn">Lưu vào Firestore</button>`;
      const saveBtn = document.getElementById("saveBtn");
      saveBtn.addEventListener("click", async () => {
        try {
          await addDoc(collection(db, "dictionary"), {
            word: wordData.word,
            meaning: meaningsHTML,
            vietnamese: vietnamese,
            user: session.user.email,
            createdAt: new Date(),
          });
          alert("✅ Đã lưu từ vào Firestore!");
        } catch (err) {
          console.error(err);
          alert("❌ Lỗi khi lưu vào Firestore");
        }
      });
    } else {
      resultBox.innerHTML += `<p style="color:red;">🔒 Đăng nhập để lưu từ này</p>`;
    }
  });
}

// ================== TẢI DANH SÁCH FIRESTORE (THEO USER) ================== //
function loadWordsFromFirestore() {
  const savedList = document.getElementById("savedList");
  if (!savedList) return;

  const session = JSON.parse(localStorage.getItem("user_session"));
  if (!session || !session.user) {
    savedList.innerHTML = "<li>🔒 Đăng nhập để xem từ đã lưu</li>";
    return;
  }

  const q = query(collection(db, "dictionary"), where("user", "==", session.user.email));

  onSnapshot(q, (snapshot) => {
    savedList.innerHTML = "";
    if (snapshot.empty) {
      savedList.innerHTML = "<li>Chưa có từ nào được lưu.</li>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.word}</strong> 
        <button onclick="updateWord('${docSnap.id}', '${data.word}')">✏️</button>
        <button onclick="deleteWord('${docSnap.id}')">🗑️</button>
      `;
      savedList.appendChild(li);
    });
  });
}

// ================== CẬP NHẬT & XOÁ ================== //
window.updateWord = async function (id, oldWord) {
  const newWord = prompt("Nhập lại từ:", oldWord);
  if (!newWord) return;
  try {
    await updateDoc(doc(db, "dictionary", id), { word: newWord });
    alert("✅ Đã cập nhật!");
  } catch (e) {
    console.error(e);
    alert("❌ Lỗi khi cập nhật");
  }
};

window.deleteWord = async function (id) {
  if (!confirm("Xoá từ này?")) return;
  try {
    await deleteDoc(doc(db, "dictionary", id));
    alert("🗑️ Đã xoá!");
  } catch (e) {
    console.error(e);
    alert("❌ Lỗi khi xoá");
  }
};