export function renderIncomingMessage(msg) {
  const container = document.querySelector(".chat-messages");
  const userId = Number(localStorage.getItem("userId"));
  const isOwnMessage = msg.senderId === userId;

  //檢查容器是否存在
  if (!container) {
    console.error("找不到 .chat-messages 容器");
    return;
  }
  const msgEl = document.createElement("div");
  msgEl.className = isOwnMessage
    ? "chat-message chat-message-right"
    : "chat-message chat-message-left";

  msgEl.innerHTML = `
    <div class="chat-bubble">${msg.content}</div>
  `;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

export function renderChatList(chatList, onItemClick) {
  const container = document.querySelector(".chat-list");
  if (!container) {
    console.error("找不到 .chat-list 容器");
    return;
  }
  container.innerHTML = "";
  chatList.forEach((room) => {
    const item = document.createElement("div");
    item.className = "chat-list-item";
    item.dataset.chatRoomId = room.chatRoomId;
    item.dataset.receiverId = room.receiverId?.id || room.receiverId;
    item.dataset.hotelId = room.hotelId?.id || room.hotelId;
    item.dataset.lastMessage = room.lastMessage || "";
    item.dataset.displayName = room.displayName || "未命名";

    item.innerHTML = `
      <div class="chat-hotel-info">
        <div class="chat-hotel-name">${item.dataset.displayName}</div>
        <div class="chat-preview">${(item.dataset.lastMessage || "").slice(
          0,
          10
        )}</div>
      </div>
    `;
    item.addEventListener("click", () => onItemClick(item));
    container.appendChild(item);
  });
}

export function renderChatBox(hotelName) {
  const chatBox = document.querySelector(".chat-box");
  if (!chatBox) {
    console.error("找不到 .chat-box 容器");
    return;
  }
  chatBox.innerHTML = `
    <div class="chat-header"><h4>${hotelName}</h4></div>
    <div class="chat-messages"></div>
    <div class="chat-input">
      <input type="text" id="messageInput" placeholder="輸入訊息..." />
      <button class="btn btn-secondary" id="sendBtn">送出</button>
    </div>
  `;
}
