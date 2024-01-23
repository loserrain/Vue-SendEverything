import SparkMD5 from "spark-md5";

export function calculateChunkId(file, chunkNumber, chunkSize) {
    return new Promise((resolve) => {
        const start = chunkNumber * chunkSize;
        const end = start + chunkSize;
        const fileId = file.name + "_" + (file.lastModified.valueOf() + new Date().valueOf()) + "_" + file.size;
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