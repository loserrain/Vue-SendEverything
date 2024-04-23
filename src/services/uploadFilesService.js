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
    return http.get(`/getFiles`);
  }

  uploadMessage(message){
    return http.post("/uploadMessage", { content: message });
  }

  getMessage(receiveCode) {
    return http.post(`/getMessage`, { code: receiveCode });
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

  getFileNameByCode(code) {
    return http.get(`/getFileNameByCode/${code}`);
  }

  deleteFileByCode(code) {
    return http.get(`/cleanupByCode/${code}`);
  }

}

export default new UploadFilesService();
