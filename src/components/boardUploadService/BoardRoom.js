import http from "./http-common.js";

class BoardUploadService {
  uploadMessageWithImage(message, image) {
    let formData = new FormData();
    formData.append("message", message);
    formData.append("image", image);

    return http.post("/uploadMessageWithImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
}