const form = document.querySelector('.login-passwd');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // 防止表單提交
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email) {
      alert('請輸入電子信箱');
      return;
    }

    if (!password) {
      alert('請輸入密碼');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/auth/login-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        // 從後端取得錯誤訊息
        const errorText = await res.text();
        throw new Error(errorText || '登入失敗');
      }

      const data = await res.json();
      // 假設後端回傳 { token: '...' }
      localStorage.setItem('jwtToken', data.token);

      alert('登入成功');
      // 登入成功後導回首頁或會員頁
      window.location.href = '../../pages/homepage/home.html';

    } catch (err) {
      alert('錯誤：' + err.message);
    }
  });
}
