import {
  connectWebSocket,
  subscribeChatRoom,
  sendMessage,
  loadChatHistory,
} from "./user_center/chatService.js";
import {
  renderIncomingMessage,
  renderChatList,
  renderChatBox,
} from "./user_center/domUtils.js";

import { setChatContext, getChatContext } from "./user_center/chatContext.js";


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

// ===================== 住宿訊息聊天室 =====================
document.addEventListener("DOMContentLoaded", () => {
  connectWebSocket();
  fetch("http://localhost:8080/api/chatrooms/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("未授權或伺服器錯誤");
      }
      return res.json();
    })
    .then((chatList) => {
      console.log("後端傳來的chatList：", chatList);
      renderChatList(chatList, handleChatListItemClick);
    })
    .catch((err) => {
      console.error("無法取得聊天室列表：", err);
    });
});

// ==================== 點聊天室項目 =====================

async function handleChatListItemClick(item) {
  // 更新全域變數
  const chatRoomId = Number(item.dataset.chatRoomId);
  const receiverId = Number(item.dataset.receiverId);
  const hotelId = Number(item.dataset.hotelId);
  const displayName =
    item.dataset.displayName ||
    item.querySelector(".chat-hotel-name").textContent;
  console.log("點擊聊天室：", {
    chatRoomId,
    receiverId,
    hotelId,
  });
  //存好 context
  setChatContext(chatRoomId, receiverId, hotelId);

  // 訂閱該聊天室
  subscribeChatRoom(chatRoomId);

  //渲染聊天室頁面
  renderChatBox(displayName);

  //載入歷史訊息
  const history = await loadChatHistory(chatRoomId);
  const container = document.querySelector(".chat-messages");
  container.innerHTML = "";
  history.forEach((msg) => renderIncomingMessage(msg));

  // 修改：只綁定一次發送按鈕事件
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn && !sendBtn._bound) {
    sendBtn.addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      const content = input.value.trim();
      if (content) {
        sendMessage(content);
        input.value = "";
      }
    });
    sendBtn._bound = true;
  }
}