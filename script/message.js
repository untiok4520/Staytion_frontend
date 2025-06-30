
const chatData = {
    "王小明": [
        { sender: "王小明", time: "2025/06/06 10:12", text: "請問可以提早入住嗎？" },
        { sender: "host", time: "2025/06/06 10:15", text: "可以，我們可提前 1 小時為您準備。" }
    ],
    "林小花": [
        { sender: "林小花", time: "2025/06/05 09:00", text: "是否提供早餐？" }
    ],
    "陳大雄": [
        { sender: "host", time: "2025/06/03 14:21", text: "您好，歡迎入住！" },
        { sender: "陳大雄", time: "2025/06/03 14:25", text: "請問有停車位嗎？" }
    ]
};

let currentUser = "王小明";
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const chatForm = document.getElementById("chatForm");
const fileInput = document.getElementById("fileInput");
const chatUserList = document.getElementById("chatUserList");
const currentUserLabel = document.getElementById("currentUser");
const chatLoading = document.getElementById("chatLoading");

function renderChat(user) {
    chatLoading.classList.remove("d-none");
    setTimeout(() => {
        currentUser = user;
        currentUserLabel.textContent = user;
        chatBox.innerHTML = "";
        (chatData[user] || []).forEach(msg => {
            const msgBox = document.createElement("div");
            msgBox.className = `mb-2 ${msg.sender === "host" ? "text-end" : ""}`;
            msgBox.innerHTML = `
          <div class="small text-muted">${msg.time}</div>
          <div class="d-inline-block px-3 py-2 rounded ${msg.sender === "host" ? "bg-primary text-white" : "bg-light border"}">
            ${msg.text}
          </div>
        `;
            chatBox.appendChild(msgBox);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
        chatLoading.classList.add("d-none");
    }, 500);
}

chatUserList.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
        chatUserList.querySelectorAll("li").forEach(el => el.classList.remove("active"));
        li.classList.add("active");
        renderChat(li.dataset.user);

        if (window.innerWidth < 768) {
            document.getElementById("chatUserPanel").classList.add("d-none");
        }

    });
});

chatForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = chatInput.value.trim();
    const file = fileInput.files[0];
    const now = new Date().toLocaleString("zh-TW", { hour12: false });
    if (!text && !file) return;

    const newMsg = { sender: "host", time: now, text: "" };
    if (text) newMsg.text = text;
    if (file) {
        newMsg.text += text ? "<br>" : "";
        newMsg.text += `<a href="#" target="_blank">📎 ${file.name}</a>`;
    }

    chatData[currentUser] = chatData[currentUser] || [];
    chatData[currentUser].push(newMsg);

    renderChat(currentUser);
    chatInput.value = "";
    fileInput.value = "";
});

function toggleUserPanel() {
    const panel = document.getElementById("chatUserPanel");
    panel.classList.toggle("d-none");
}

document.addEventListener("DOMContentLoaded", () => {
    renderChat(currentUser);
});

// 使用者登入狀態檢查
$(function () {
  const token = localStorage.getItem('jwtToken');
  const userName = localStorage.getItem('userName') || '使用者名稱'; // 可從登入回傳存userName

  const $loginBtn = $('#loginBtn');
  const $userDropdown = $('#userDropdown');
  const $logoutBtn = $('#logoutBtn');
  const $userDropdownToggle = $('#userDropdownMenu');

  if (token) {
    $loginBtn.addClass('d-none');
    $userDropdown.removeClass('d-none');
    $userDropdownToggle.text(userName);
  } else {
    $loginBtn.removeClass('d-none');
    $userDropdown.addClass('d-none');
  }

  $logoutBtn.on('click', function () {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    location.reload();
  });
});