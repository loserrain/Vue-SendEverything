import SparkMD5 from "spark-md5";

export function boardCalculateChunkId(file, chunkNumber, chunkSize) {
    return new Promise((resolve) => {
        const start = chunkNumber * chunkSize;
        const end = start + chunkSize;
        let fileId = "";
        
        fileId = file.name + "_" + file.lastModified.valueOf() + "_" + file.size;
        const spark = new SparkMD5.ArrayBuffer();
        const totalChunks = Math.ceil(file.size / chunkSize);
        const fileReader = new FileReader();
        const fileName = file.name;

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
                fileName
            });
            // console.log("fileId", fileId)
        };

        fileReader.readAsArrayBuffer(file.slice(start, end))
    })
}