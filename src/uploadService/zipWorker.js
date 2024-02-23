import JSZip from 'jszip';

onmessage = (event) => {
    const { filesData } = event.data;
    const zip = new JSZip();

    filesData.forEach(({ name, content }) => {
        zip.file(name, content)
    })

    zip.generateAsync({
        type: 'blob',
    })
    .then((content) => {
        postMessage(content)
    })
    .catch((error) => {
        console.log("Error creating zip file:", error)
    })
}