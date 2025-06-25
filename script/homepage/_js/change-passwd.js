const form = document.querySelector("form.change-passwd");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("repasswd").value.trim();
        const token = new URLSearchParams(window.location.search).get("token"); // 假設 token 在 URL 中

        // 基本欄位驗證
        if (!newPassword || !confirmPassword) {
            alert("請輸入新密碼和確認密碼");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("密碼與確認密碼不一致");
            return;
        }

        try {
            // 發送 POST 請求到後端的重設密碼 API
            const response = await fetch("http://localhost:8080/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token, // 發送 token
                    newPassword, // 發送新密碼
                    confirmPassword // 發送確認密碼
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || "密碼已更新！請重新登入");
                window.location.href = '../../pages/homepage/login-passwd.html';
            } else {
                const error = await response.json();
                alert("發生錯誤: " + (error.message || "請稍後再試"));
            }
        } catch (error) {
            alert("系統錯誤: " + error.message);
        }
    });
}

// 解析 URL 中的 token 參數
function getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

// 解析 JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        console.log("JWT 解析結果:", payload);
        return payload;
    } catch (error) {
        console.error("解析 JWT token 失敗:", error);
        return null;
    }
}

/// 判斷是從 URL 還是 localStorage 取得 token
let token = localStorage.getItem('jwtToken'); // 優先從 localStorage 取得

if (!token) {
    token = getTokenFromUrl(); // 如果 localStorage 沒有，則從 URL 取得
}


const payload = parseJwt(token); // 解析 token
if (!payload || !payload.sub) {
    console.error('無法取得 email 或解析失敗');
    console.log('無效的 token 或無法取得用戶 email');
}

console.log("取得的 email:", payload.sub);  // 打印 email

// 顯示 email 到頁面
const emailDisplay = document.getElementById('userEmail');
if (emailDisplay && payload.sub) {
    emailDisplay.innerText = payload.sub;
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
