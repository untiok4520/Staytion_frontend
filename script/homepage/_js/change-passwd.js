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
