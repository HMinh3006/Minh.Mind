
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"; 
import { auth, db } from './firebase-config.js';

// Input elements
const inpUsername = document.querySelector("#regUsername");
const inpEmail = document.querySelector("#regEmail");
const inpPwd = document.querySelector("#regPassword");
// const inpConfirmPwd = document.querySelector(".inp-cf-pw");
const registerForm = document.querySelector("#registerForm");

// Handle register
async function handleRegister(event) {
  event.preventDefault(); // ngăn reload form

  const username = inpUsername.value.trim();
  const email = inpEmail.value.trim();
  const password = inpPwd.value;
//   const confirmPassword = inpConfirmPwd.value;
  const role_id = 2; // guest = 2, admin = 1

  // Kiểm tra input
  if (!username  || !email || !password) {
    alert("Vui lòng điền đủ các trường");
    return;
  }


  try {
    // Tạo user trong Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Data lưu trong Firestore
    const userData = {
      username,
        email,
        password,

      role_id,
      balance: 0,
      createdAt: new Date()
    };

    // Lưu vào Firestore, document id = uid
    await setDoc(doc(db, "users", user.uid), userData);

    alert("Đăng ký thành công!");
    registerForm.reset();
  } catch (error) {
    console.error("Error: ", error.message);
    alert("Lỗi: " + error.message);
  }
}

// Gán sự kiện submit cho form
registerForm.addEventListener("submit", handleRegister);


// ================== DARK MODE ================== //
const toggleBtn = document.getElementById("toggle-dark");

// Kiểm tra xem user đã lưu chế độ trước đó chưa
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleBtn.textContent = "☀️ Light Mode";
}

// Khi bấm nút -> đổi theme
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "🌙 Dark Mode";
  }
});