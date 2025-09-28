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
