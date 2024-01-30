import SparkMD5 from "spark-md5";

export function calculateChunkId(file, chunkNumber, chunkSize, fileListLength, zipFileName) {
    return new Promise((resolve) => {
        const start = chunkNumber * chunkSize;
        const end = start + chunkSize;
        let fileId = "";
        if(fileListLength >= 2){
            fileId = zipFileName;
        } else {
            fileId = file.name + "_" + file.lastModified.valueOf() + "_" + file.size;
        }
        // console.log("workerFileid:", fileId)
        const spark = new SparkMD5.ArrayBuffer();
        const totalChunks = Math.ceil(file.size / chunkSize);
        const fileReader = new FileReader();

        fileReader.onload = function(e) {
            spark.append(e.target.result);
            const chunkId = spark.end();
            resolve({
                start,
                end,
                totalChunks,
                chunkNumber,
                chunkId: chunkId,
                fileChunk: file.slice(start, end),
                fileId,
            });
        };

        fileReader.readAsArrayBuffer(file.slice(start, end))
    })
}