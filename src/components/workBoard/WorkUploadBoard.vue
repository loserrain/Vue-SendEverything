<script setup>
import { ref } from 'vue';

const emits = defineEmits(["sendUploadStatus"]);

function handleSendUploadStatus(newStatus) {
    emits("sendUploadStatus", newStatus);
}

const fileCount = 2;

</script>

<template>
    <div class="upload-board-mask" @click="handleSendUploadStatus(false)">
        <div class="upload-board-page" @click.stop>
            <div class="upload-board-page-title">
                <h2>
                    <span><font-awesome-icon :icon="['far', 'file']" /></span>
                    Upload Files
                </h2>
                <p>Attachments that have been uploaded as part of this project.</p>
            </div>

            <div class="upload-board-select">
                <p><font-awesome-icon :icon="['far', 'file']" /></p>
                <h3>Drag & drop your files here or
                    <span>
                        <label type="button" for="fileInput"> choose files </label>
                        <input type="file" name="fileInput" id="fileInput" />
                    </span>
                </h3>
                <h4>500 MB max file size.</h4>
            </div>

            <div class="upload-board-fileTitle">
                <h2>Uploaded Files</h2>
                <div class="upload-board-fileList">
                    <div class="upload-board-file" v-for="count in fileCount">
                        <div class="upload-board-file-data">
                            <span><font-awesome-icon :icon="['far', 'file']" /></span>
                            <div>
                                <p>Universal-System-Web.mp4</p>
                                <p>40.9MB</p>
                            </div>
                        </div>
                        <div class="upload-board-textarea">
                            <textarea name="textarea" id="textarea" rows="2"
                                placeholder="Please enter a brief description of the file.&nbsp;"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="upload-board-decide">
                <button @click="handleSendUploadStatus(false)">Cancel</button>
                <button>Attach files</button>
            </div>

            <span @click="handleSendUploadStatus(false)"><font-awesome-icon icon="xmark" /></span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.upload-board-mask {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.65);
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
}

.upload-board-page {
    position: relative;
    height: 709px;
    width: 558px;
    background-color: #FAFAFA;
    border: 8px solid #DEDFE4;
    border-radius: 5px;
    padding: 2rem 1.7rem 4px 2rem;

    .upload-board-page-title {
        margin-left: .5rem;

        h2 {
            font-size: 24px;
            font-weight: bold;
            color: #1E3050;
            user-select: none;
        }

        p {
            font-size: 16px;
            font-weight: bold;
            color: #8B8B8B;
            margin-top: 8px;
            user-select: none;
        }
    }

    >span {
        position: absolute;
        top: 10px;
        right: 16px;
        font-size: 22px;
        color: #767676;
        cursor: pointer;
    }

    .upload-board-select {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 483px;
        height: 169px;
        border: 2px dashed #0013DD;
        background-color: #F8FAFF;
        margin: 1.8rem 0 2rem;

        p {
            font-size: 45px;
            color: #1E3050;
            margin-top: 5px;
        }

        h3 {
            font-size: 16px;
            color: #242323;

            span {
                label {
                    color: #6A74E4;
                    text-decoration: underline;
                    cursor: pointer;
                }
                input {
                    display: none;
                }
            }
        }

        h4 {
            margin-bottom: 8px;
            color: #8B8B8B;
        }
    }

    .upload-board-fileTitle {
        h2 {
            font-size: 20px;
            font-weight: bold;
            color: #1E3050;
            margin-bottom: 1rem;
        }

        .upload-board-fileList {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 1rem;

            .upload-board-file {
                width: 483px;
                height: 121px;
                border: 2px solid #E9EAEF;
                border-radius: 4px;
                padding: 12px 1rem 8px;

                .upload-board-file-data {
                    display: flex;

                    span {
                        font-size: 32px;
                        color: #626f86;
                    }

                    >div {
                        margin-left: 10px;

                        p:first-child {
                            font-size: 16px;
                            font-weight: bold;
                            color: #1E3050;
                            margin-bottom: 4px;
                        }

                        p {
                            font-size: 12px;
                            color: #8B8B8B;
                            user-select: none;
                        }
                    }
                }

                .upload-board-textarea {
                    margin-top: 10px;

                    textarea {
                        width: 450px;
                        border: 2px solid #DAD8D8;
                        border-radius: 4px;
                        background-color: #F8FAFF;
                        color: #868686;
                        outline: none;
                        resize: none;
                    }
                }

            }

        }
    }

    .upload-board-decide {
        display: flex;
        justify-content: space-between;
        margin-top: 1.8rem;

        button {
            border: 2px solid #B0B3C5;
            border-radius: 6px;
            background-color: #004DE4;
            font-size: 16px;
            font-weight: bold;
            color: #FFFFFF;
            width: 233px;
            height: 39px;
            cursor: pointer;

            &:first-child {
                background: none;
                font-size: 16px;
                font-weight: bold;
                color: #1E3050;
            }
        }

    }
}
</style>