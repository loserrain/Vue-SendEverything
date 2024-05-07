import http from "../../services/http-common.js";

class BoardUploadService {
  uploadMessageWithImage(roomData, imageFile) {
    let formData = new FormData();
    formData.append("title", roomData.title);
    formData.append("roomDescription", roomData.description);
    formData.append("roomPassword", roomData.pwd);
    formData.append("roomType", roomData.roomType);
    formData.append("boardType", roomData.boardType);
    formData.append("roomImage", imageFile);
    formData.append("userPublicKey", roomData.userPublicKey);
    formData.append("userPrivateKey", roomData.userPrivateKey);
    formData.append("roomPrime", roomData.roomPrime);
    formData.append("initVector", roomData.initVector);
    return http.post("/createRoom", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }

  getAllRooms(boardType) {
    return http.post("/getAllRooms", { boardType });
  }

  accessRoom(password, roomCode, roomType, userPublicKey, userPrivateKey) {
    return http.post("/accessRoom", { password, roomCode, roomType, userPublicKey: userPublicKey.toString(), userPrivateKey: userPrivateKey.toString() });
  }

  verifyCookie(roomCode, roomType) {
    return http.post("/verifyCookie", { roomCode, roomType });
  }

  showRoomContent(roomCode) {
    return http.post("/showRoomContent", { roomCode });
  }

  cleanUpRoomFileByCode(roomCode) {
    return http.get(`/cleanupRoomFileByCode/${roomCode}`);
  }

  getChatMessageKeyAndIV(roomCode) {
    return http.post("/getChatMessageKeyAndIV", { roomCode: roomCode }, { responseType: 'json' });
  }

  getChatMessageHistorySharedKey(roomCode) {
    return http.post("/getChatMessageHistorySharedKey", { roomCode: roomCode }, { responseType: 'json' });
  }
}

export default new BoardUploadService();