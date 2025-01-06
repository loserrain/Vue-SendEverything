import http from "./Unify_API/http-common";

class BoardUploadService {
  // RequestParam，建立房間時需要圖片，roomImage為檔案，故採用FormData格式
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

  // RequestBody，使用boardType分辨佈告欄與作業版類型，並取得房間資訊
  getAllRooms(boardType) {
    return http.post("/getAllRooms", { boardType });
  }

  // RequestBody
  accessRoom(password, roomCode, roomType, userPublicKey, userPrivateKey) {
    return http.post("/accessRoom", { password, roomCode, roomType, userPublicKey: userPublicKey.toString(), userPrivateKey: userPrivateKey.toString() });
  }

  // RequestBody
  verifyCookie(roomCode, roomType) {
    return http.post("/verifyCookie", { roomCode, roomType });
  }

  // RequestBody
  showRoomContent(roomCode) {
    return http.post("/showRoomContent", { roomCode });
  }

  cleanUpRoomFileByCode(roomCode) {
    return http.get(`/cleanupRoomFileByCode/${roomCode}`);
  }
}

export default new BoardUploadService();