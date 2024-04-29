import http from "./http-common.js";

class ChatService {
  getNewMessages(roomCode) {
    return http.post(`/getNewMessages`, { roomCode: roomCode });
  }

  getNewChatMessages(roomCode) {
    return http.post(`/getNewChatMessages`, { roomCode: roomCode });
  }

  getMessages(roomCode, messageTime) {
    return http.post(`/getMessages`, {
      roomCode: roomCode,
      lastTimestamp: messageTime,
    });
  }

  getMessageByUser() {
    return http.get(`/getMessageByUser`);
  }

  getSecretMessageByUser() {
    return http.get(`/getSecretMessageByUser`);
  }

  getFileInfoByRoomCode(roomCode) {
    return http.post(`/getFileInfoByRoomCode`, { code: roomCode });
  }

  createSecretChat(chatData) {
    let formData = new FormData();
    formData.append("title", chatData.title);
    formData.append("roomDescription", chatData.description);
    formData.append("roomPassword", chatData.pwd);
    formData.append("roomType", chatData.roomType);
    formData.append("boardType", chatData.boardType);
    formData.append("roomImage", chatData.chatImage);

    return http.post("/createRoom", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new ChatService();
