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

// 導覽列 -------------------------------------------------

//貨幣切換按鈕
document
    .querySelectorAll("#currencyModal .modal-body.modal-grid a")
    .forEach(function (item) {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const html = this.innerHTML.trim();
            const parts = html.split("<br>");
            const code = parts[parts.length - 1].trim(); // 取最後一行的貨幣代碼
            const btn = document.querySelector(
                'button[data-bs-target="#currencyModal"]'
            );
            if (btn) {
                btn.textContent = code;
            }
            //關閉modal
            const modalEl = document.getElementById("currencyModal");
            const modalInstance =
                window.bootstrap && window.bootstrap.Modal
                    ? window.bootstrap.Modal.getInstance(modalEl)
                    : typeof bootstrap !== "undefined" && bootstrap.Modal
                        ? bootstrap.Modal.getInstance(modalEl)
                        : null;
            if (modalInstance) modalInstance.hide();
        });
    });

//語言切換按鈕
document
    .querySelectorAll("#languageModal .modal-body.modal-grid > div")
    .forEach(function (item) {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const span = this.querySelector("span.fi");
            const btn = document.querySelector(
                'button[data-bs-target="#languageModal"]'
            );
            if (span && btn) {
                // 將button的內容換成<span>
                btn.innerHTML = span.outerHTML;
            }
            // 關閉 modal
            const modalEl = document.getElementById("languageModal");
            const modalInstance =
                window.bootstrap && window.bootstrap.Modal
                    ? window.bootstrap.Modal.getInstance(modalEl)
                    : typeof bootstrap !== "undefined" && bootstrap.Modal
                        ? bootstrap.Modal.getInstance(modalEl)
                        : null;
            if (modalInstance) modalInstance.hide();
        });
    });

    