import http from "./http-common.js";

class BoardUploadService {
  uploadMessageWithImage(roomData, imageFile) {
    let formData = new FormData();
    formData.append("title", roomData.title);
    formData.append("roomDescription", roomData.description);
    formData.append("roomPassword", roomData.pwd);
    formData.append("roomType", roomData.roomType);
    formData.append("roomImage", imageFile);

    return http.post("/createRoom", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }

  getRoomList() {
    return http.get("/roomList");
  }

  loginRoom(password, roomCode) {
    return http.post("/AccessRoom", { password, roomCode });
  }
}

export default new BoardUploadService();