// 註冊
document.querySelector("form.register")?.addEventListener("submit", async (e) => {
  e.preventDefault();



  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const tel = document.getElementById("tel").value.trim();

  // console.log({
  //   firstName,
  //   lastName,
  //   email,
  //   password,
  //   tel
  // });

  // 基本欄位驗證
  if (!firstName || !lastName || !email || !password || !tel) {
    alert("請完整填寫所有欄位");
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
      credentials: "include" // 如果後端要設 cookie（可保留）
    });

    if (!response.ok) {
      const err = await response.json();
      alert("註冊失敗：" + (err.message || JSON.stringify(err)));
      return;
    }

    const data = await response.json();
    alert("註冊成功！請前往信箱點擊驗證連結完成啟用。");
    window.location.href = "../../pages/homepage/login.html";

  } catch (error) {
    alert("系統錯誤：" + error.message);
  }
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
