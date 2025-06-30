let chatContext = {
  chatRoomId: null,
  receiverId: null,
  hotelId: null,
};

export function setChatContext(chatRoomId, receiverId, hotelId) {
  chatContext = { chatRoomId, receiverId, hotelId };
}

export function getChatContext() {
  return chatContext;
}
