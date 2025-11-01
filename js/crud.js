// crud.js
import {
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "./firebase-config.js";

// ================== THÊM TỪ ================== //
export async function addWordToFirestore(word, meaning, vietnamese, userEmail) {
  try {
    await addDoc(collection(db, "dictionary"), {
      word,
      meaning,
      vietnamese,
      user: userEmail,
      createdAt: new Date(),
    });
    alert("Đã lưu từ vào Firestore!");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi lưu vào Firestore");
  }
}

// ================== TẢI DANH SÁCH ================== //
export function loadWordsFromFirestore(userEmail, listElementId) {
  const savedList = document.getElementById(listElementId);
  if (!savedList) return;

  const q = query(collection(db, "dictionary"), where("user", "==", userEmail));

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
export async function updateWord(id, newWord) {
  try {
    await updateDoc(doc(db, "dictionary", id), { word: newWord });
    alert("Đã cập nhật!");
  } catch (e) {
    console.error(e);
    alert("Lỗi khi cập nhật");
  }
}

export async function deleteWord(id) {
  try {
    await deleteDoc(doc(db, "dictionary", id));
    alert("Đã xoá!");
  } catch (e) {
    console.error(e);
    alert("Lỗi khi xoá");
  }
}
