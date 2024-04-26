import http from "./http-common.js";

class ChatService {
    getNewMessages(roomCode) {
      return http.post(`/getNewMessages`, { roomCode: roomCode });
    }

    getMessages(roomCode, messageTime) {
      return http.post(`/getMessages`, { roomCode: roomCode, lastTimestamp: messageTime });
    }

    getMessageByUser() {
      return http.get(`/getMessageByUser`);
    }
  }
  
  export default new ChatService();