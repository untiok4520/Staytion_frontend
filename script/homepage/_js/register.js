document.addEventListener('DOMContentLoaded', () => {
  // 嘗試從 sessionStorage 中獲取註冊頁面 email
  const email = sessionStorage.getItem('registerEmail');
  console.log('Session email on register page:', email);

  if (email) {
    // 找到註冊頁面的 email 輸入框
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.value = email.trim();  // 填入 email
    }
    // 使用後刪除 email，防止在頁面刷新後再次填充
    sessionStorage.removeItem('registerEmail');
  }
});

// 註冊
document.querySelector("form.register")?.addEventListener("submit", async (e) => {
  e.preventDefault();


  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const tel = document.getElementById("tel").value.trim();
  console.log(email)

  // 基本欄位驗證
  if (!firstName || !lastName || !email || !password || !tel) {
    alert("請完整填寫所有欄位");
    return;
  }

  // ✅ 驗證規則
  const errors = [];

  if (!firstName || !/^[a-zA-Z]+$/.test(firstName)) {
    errors.push("英文名字僅能填寫英文字母");
  }

  if (!lastName || !/^[a-zA-Z]+$/.test(lastName)) {
    errors.push("英文姓名僅能填寫英文字母");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("請輸入有效的 Email 格式");
  }

  if (!tel || !/^\d{10}$/.test(tel)) {
    errors.push("電話號碼必須是 10 位數字");
  }

  if (errors.length > 0) {
    alert("請修正以下錯誤：\n" + errors.join("\n"));
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        tel
      }),
      // credentials: "include" // 如果後端要設 cookie（可保留）
    });

    if (!response.ok) {
      // const err = await response.json();
      alert("註冊失敗，請稍後再試");
      return;
    }

    const data = await response.json();
    alert("註冊成功！請前往信箱點擊驗證連結完成啟用。");
    window.location.href = "../../pages/homepage/login.html";

  } catch (error) {
    alert("系統發生錯誤，請稍後再試");
  }
});

// --- 1. 定義輔助工具函數 (必須放在最前面，因為很多地方都會呼叫它們) ---

// 解析 JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("解析 JWT token 失敗:", error);
    return null;
  }
}

// 顯示狀態訊息 (簡化版：只輸出到 Console)
function showStatus(message, type) {
  if (type === 'success') {
    console.log(`[Status Success]: ${message}`);
  } else {
    console.error(`[Status Error]: ${message}`);
  }
}

// 顯示用戶資訊 (簡化版：只輸出到 Console，不操作 DOM)
function displayUserInfo(userInfo) {
  if (!userInfo) {
    console.warn("[Display User Info]: 無法取得用戶資訊。");
    return;
  }
  console.log("[User Info Received]:", userInfo);
}


// --- 2. 定義 Google 登入相關的主要邏輯函數 ---

// 設定你的 Google Client ID
const GOOGLE_CLIENT_ID = "758704408406-hi6ccc9ht6130a9ddgrbfqprunh0fvlj.apps.googleusercontent.com";

// 處理 Google 登入回調
function handleCredentialResponse(response) {
  try {
    console.log("收到 Google 認證回應");
    const payload = parseJwt(response.credential);
    console.log("用戶資訊解碼:", payload); // 這裡使用解碼後的 payload

    displayUserInfo(payload); // 呼叫簡化後的 displayUserInfo
    sendTokenToBackend(response.credential);

    showStatus('登入成功！', 'success');

  } catch (error) {
    console.error("處理 Google 登入時發生錯誤:", error);
    showStatus('登入失敗: ' + error.message, 'error');
  }
}

// 初始化 Google Sign-In
function initializeGoogleSignIn() {
  try {
    console.log("開始初始化 Google Sign-In");

    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      showStatus('Google API 尚未載入完成或未初始化，請稍後再試...', 'error');
      setTimeout(initializeGoogleSignIn, 500); // 0.5 秒後重試
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    const googleSignInDiv = document.getElementById("googleSignInDiv");
    if (googleSignInDiv) {
      google.accounts.id.renderButton(
        googleSignInDiv,
        {
          theme: "outline",
          size: "large",
          width: "400",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left"
        }
      );
      console.log("Google Sign-In 初始化完成並渲染按鈕。");
    } else {
      console.error("無法找到 googleSignInDiv 元素，請檢查 HTML！");
      showStatus('錯誤：無法找到 Google 登入按鈕的顯示位置', 'error');
    }

  } catch (error) {
    console.error("初始化 Google Sign-In 時發生錯誤:", error);
    showStatus('初始化失敗: ' + error.message, 'error');
  }
}

// 發送用戶資料到後端
async function sendTokenToBackend(idToken) {
  try {
    console.log("準備將 Google Token 發送到後端進行驗證");
    const payload = parseJwt(idToken);
    if (!payload) {
      throw new Error('無法解析 Google ID Token');
    }

    const googleUserData = {
      email: payload.email,
      firstName: payload.given_name || '',
      lastName: payload.family_name || ''
    };

    console.log("準備發送的用戶資料:", googleUserData);

    const response = await fetch('http://localhost:8080/api/auth/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleUserData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("後端回應:", data);

    if (data.token) {
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userId', data.user.id);
      console.log("JWT token 已儲存到 localStorage。");
      // 登入成功後，你可能需要導向到其他頁面
      window.location.href = "../../pages/homepage/home.html";
    }
    showStatus('後端處理成功！', 'success');
    return data;

  } catch (error) {
    console.error("發送到後端失敗:", error);
    showStatus('後端驗證失敗: ' + error.message, 'error');
    throw error;
  }
}

// 當頁面載入完成時初始化 Google Sign-In
window.onload = function () {
  initializeGoogleSignIn();
};


// --- 4. 全局錯誤和載入狀態監聽 ---

// 錯誤處理 (會呼叫 showStatus，現在只輸出到 Console)
window.addEventListener('error', function (e) {
  console.error('頁面錯誤:', e.error);
  showStatus('發生未預期錯誤，請檢查 Console。', 'error');
});

// 監聽 Google API 載入狀態 (會呼叫 showStatus，現在只輸出到 Console)
window.addEventListener('load', function () {
  setTimeout(() => {
    if (typeof google === 'undefined') {
      console.error('Google API 載入失敗或超時，請檢查網路連接。');
      showStatus('Google API 載入失敗，請檢查 Console 和網路連接。', 'error');
    }
  }, 5000);
});

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
