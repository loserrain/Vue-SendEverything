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

    return http.post("/createRoom", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }

  getAllRooms(boardType) {
    return http.post("/getAllRooms", { boardType });
  }

  accessRoom(password, roomCode) {
    return http.post("/accessRoom", { password, roomCode });
  }

  verifyCookie(roomCode) {
    return http.post("/verifyCookie", { roomCode });
  }

  showRoomContent(roomCode) {
    return http.post("/showRoomContent", { roomCode });
  }
}

export default new BoardUploadService();