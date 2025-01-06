import http from "./Unify_API/http-common";

class UploadFilesService {

  getFiles() {
    return http.get(`/getFiles`);
  }

  // RequestBody
  uploadMessage(message){
    return http.post("/uploadMessage", { content: message });
  }

  // RequestBody，使用下載碼取得訊息
  getMessage(receiveCode) {
    return http.post(`/getMessage`, { code: receiveCode });
  }

  // RequestParam，上傳檔案分片，使用FormData
  uploadChunk(file) {
    return http.post("/uploadChunk", file, {
      headers: {
        "content-Type": "multipart/form-data"
      }
    });
  }

  // RequestParam，完成檔案上傳，並傳送輸出檔案名稱與FileId作為辨識，使用FormData
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

  // // RequestParam，上傳房間檔案分片，使用FormData
  uploadRoomFileChunk(file) {
    return http.post("/uploadRoomFileChunk", file, {
      headers: {
        "content-Type": "multipart/form-data"
      },
    });
  }

  // RequestParam，
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
