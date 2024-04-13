import http from "./http-common.js";

class UploadFilesService {
  upload(file, onUploadProgress) {
    let formData = new FormData();

    formData.append("file", file);

    return http.post("/uploadFile", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: onUploadProgress
    });
  }

  getFiles() {
    return http.get(`/getFile`);
  }

  test() {
    return http.post(`/s3download`);
  }


  uploadMessage(message){
    return http.post("/uploadMessage", message);
  }

  uploadChunk(file) {
    return http.post("/uploadChunk", file, {
      headers: {
        "content-Type": "multipart/form-data"
      }
    });
  }

  completeFileUpload(fileId, outputFileName, totalFileId) {
    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("outputFileName", outputFileName);
    formData.append("totalFileId", totalFileId)
  
    return http.post("/completeUpload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
  uploadRoomFileChunk(file) {
    return http.post("/uploadRoomFileChunk", file, {
      headers: {
        "content-Type": "multipart/form-data"
      },
    });
  }

  completeUploadRoomFile(fileId, outputFileName, totalFileId) {
    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("outputFileName", outputFileName);
    formData.append("totalFileId", totalFileId)
  
    return http.post("/completeUploadRoomFile", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }

}

export default new UploadFilesService();
