import http from "./http-common.js";

class UploadFilesService {
  upload(file, onUploadProgress) {
    let formData = new FormData();

    formData.append("file", file);

    return http.post("/uploadFile", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress
    });
  }

  getFiles() {
    return http.get(`/getFile`);
  }

  uploadMessage(message){
    return http.post("/uploadMessage", message);
  }
}

export default new UploadFilesService();
