import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const inpEmail = document.querySelector("#loginUsername");
const inpPwd = document.querySelector("#loginPassword");
const loginForm = document.querySelector("#loginForm");

const handleLogin = function(event) {
    event.preventDefault();

    let email = inpEmail.value.trim()
    let password = inpPwd.value.trim();
    if (!email || !password){
        alert("Vui lòng điền đầy đủ các trường dữ liệu");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;

        const userSession = {
            user: {
                email: user.email
            },
            expiry: new Date().getTime() + 30*1000 // 2 hours
        };

        localStorage.setItem('user_session', JSON.stringify(userSession));
        alert("Đăng nhập thành công!");
        window.location.href = 'index.html';
    })
    .catch(e =>{
        alert("Lỗi: " + e.message);
    });
};
loginForm.addEventListener("submit", handleLogin);


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