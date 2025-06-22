const form = document.querySelector("form.forgot-passwd");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // 防止表單提交

        const email = document.getElementById("email").value.trim();

        // 基本欄位驗證
        if (!email) {
            alert("請輸入電子郵件");
            return;
        }

        try {
            // 發送 POST 請求到後端的忘記密碼 API
            const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const result = await response.json();
                alert("我們已經將重設密碼的郵件發送到您的郵箱，請查收。");
            } else {
                const error = await response.json();
                alert("發送郵件失敗: " + (error.message || "請稍後再試"));
            }
        } catch (error) {
            alert("系統錯誤: " + error.message);
        }
    });
}
