import http from "./Unify_API/http-common";

class ChatService {
  // RequestBody: { roomCode: String }，用於更新佈告欄與作業版的歷史訊息，其差別在於會回傳發送訊息者的頭像
  getNewMessages(roomCode) {
    return http.post(`/getNewMessages`, { roomCode: roomCode });
  }

  // RequestBody: { roomCode: String }, 用於更新聊天室的歷史訊息，不會回傳發送訊息者的頭像
  getNewChatMessages(roomCode) {
    return http.post(`/getNewChatMessages`, { roomCode: roomCode });
  }

  // RequestBody: { roomCode: String, messageTime: String }，聊天室向上捲動時，用於取得舊的聊天訊息，需指定房間代碼與訊息的時間
  getMessages(roomCode, messageTime) {
    return http.post(`/getMessages`, {
      roomCode: roomCode,
      lastTimestamp: messageTime,
    });
  }

  // 在聊天室頁面中，取得公開聊天室的使用者聊天室訊息
  getMessageByUser() {
    return http.get(`/getMessageByUser`);
  }

  // 在聊天室頁面中，取得私密聊天室的使用者聊天室訊息
  getSecretMessageByUser() {
    return http.get(`/getSecretMessageByUser`);
  }

  // RequestBody，取得公開聊天室的檔案資訊
  getFileInfoByRoomCode(roomCode) {
    return http.post(`/getFileInfoByRoomCode`, { code: roomCode });
  }

  // RequestParam(由於有圖片檔，故使用formData)，建立私密聊天室，發送使用者計算加密金鑰的值與初始化向量
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

  // RequestBody，取得特定房間的初始向量與密鑰，並採用json格式回傳
  getChatMessageKeyAndIV(roomCode) {
    return http.post("/getChatMessageKeyAndIV", { roomCode: roomCode }, { responseType: 'json' });
  }

  // RequestBody，取得特定房間的歷史訊息的共享金鑰，並採用json格式回傳
  getChatMessageHistorySharedKey(roomCode) {
    return http.post("/getChatMessageHistorySharedKey", { roomCode: roomCode }, { responseType: 'json' });
  }

  // RequestBody，根據房間類型，取得使用者的共享金鑰(登入後後端使用Principal驗證身分)，並採用json格式回傳。此API用於解析聊天室頁面的歷史訊息
  getSharedKeysByUser(roomType){
    return http.post(`/getSharedKeysByUser`, { roomType: roomType }, { responseType: 'json' });
  }
}

export default new ChatService();
