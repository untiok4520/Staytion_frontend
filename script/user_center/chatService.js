import { renderIncomingMessage } from "./domUtils.js";
import { getChatContext } from "./chatContext.js";

let stompClient = null;
let currentChatRoomId;
let currentReceiverId;
let currentHotelId;
let currentSubscription = null;

export function connectWebSocket() {
  const socket = new SockJS("http://localhost:8080/ws");
  stompClient = Stomp.over(socket);

  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  stompClient.connect(headers, () => {
    console.log("WebSocket connected");
  });
}

export function subscribeChatRoom(chatRoomId) {
  if (!stompClient || !stompClient.connected) return;
  if (currentSubscription) currentSubscription.unsubscribe();

  currentSubscription = stompClient.subscribe(
    `/topic/chat/${chatRoomId}`,
    (message) => {
      const msg = JSON.parse(message.body);
      renderIncomingMessage(msg);
      //更新chat-list-item預覽文字
      const chatItem = document.querySelector(
        `.chat-list-item[data-chat-room-id="${msg.chatRoomId}"]`
      );
      if (chatItem) {
        const previewEl = chatItem.querySelector(".chat-preview");
        if (previewEl) {
          previewEl.textContent = msg.content.slice(0, 10);
        }
      }
    }
  );
  currentChatRoomId = chatRoomId;
}

export function sendMessage(content) {
  console.log("sendMessage 被呼叫");
  if (!stompClient) return;
  const { chatRoomId, receiverId, hotelId } = getChatContext();
  // const senderId = Number(localStorage.getItem("userId"));
  if (!chatRoomId || !receiverId || !hotelId) {
    alert("尚未選擇聊天室！");
    return;
  }
  const payload = {
    chatRoomId,
    receiverId,
    // senderId,
    hotelId,
    content,
  };
  const token = localStorage.getItem("jwtToken");
  stompClient.send(
    "/app/send",
    { Authorization: `Bearer ${token}` },
    JSON.stringify(payload)
  );
  console.log("準備送出訊息：", content);
}

export async function loadChatHistory(chatRoomId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/messages/${chatRoomId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      }
    );
    return await res.json();
  } catch (err) {
    console.error("載入歷史訊息失敗：", err);
    return [];
  }
}

export function setChatContext(chatRoomId, receiverId, hotelId) {
  currentChatRoomId = chatRoomId;
  currentReceiverId = receiverId;
  currentHotelId = hotelId;
}
