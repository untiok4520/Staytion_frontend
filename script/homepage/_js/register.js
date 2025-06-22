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
