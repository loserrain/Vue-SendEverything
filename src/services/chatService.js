import http from "./Unify_API/http-common";

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
    formData.append("userPublicKey", chatData.userPublicKey);
    formData.append("userPrivateKey", chatData.userPrivateKey);
    formData.append("roomPrime", chatData.roomPrime);
    formData.append("initVector", chatData.initVector);

    return http.post("/createRoom", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  getChatMessageKeyAndIV(roomCode) {
    return http.post("/getChatMessageKeyAndIV", { roomCode: roomCode }, { responseType: 'json' });
  }

  getChatMessageHistorySharedKey(roomCode) {
    return http.post("/getChatMessageHistorySharedKey", { roomCode: roomCode }, { responseType: 'json' });
  }

  getSharedKeysByUser(roomType){
    return http.post(`/getSharedKeysByUser`, { roomType: roomType }, { responseType: 'json' });
  }
}

export default new ChatService();
