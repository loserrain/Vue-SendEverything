import SparkMD5 from "spark-md5";

export function boardCalculateChunkId(file, chunkNumber, chunkSize, zipFileName, zipFileStatus) {
    return new Promise((resolve) => {
        const start = chunkNumber * chunkSize;
        const end = start + chunkSize;
        let fileId = "";
        let fileName = "";
        console.log("zipFileStatus", zipFileStatus)
        if(zipFileStatus){
            fileId = zipFileName;
            fileName = zipFileName;
        } else {
            fileId = file.name + "_" + file.lastModified.valueOf() + "_" + file.size;
            fileName = file.name;
        }
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
                fileName
            });
        };

        fileReader.readAsArrayBuffer(file.slice(start, end))
    })
}