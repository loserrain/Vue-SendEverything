<script setup>
import { ref, computed } from 'vue';

const emits = defineEmits(['sendDownloadStatus'])
function handleSendDownloadStatus(newStatus) {
    emits('sendDownloadStatus', newStatus)
}

const fileSizeList = 20;

// check檔案下載
const roomChecked = ref([]);

for (let i = 0; i < fileSizeList; i++) {
    roomChecked.value.push(false);
}

function handleRoomCheckboxToggle(index) {
    roomChecked.value[index] = !roomChecked.value[index];
}

const ckRoomIcon = computed(() => {
    return roomChecked.value.map(checked => checked ? ["far", "square-check"] : ["far", "square"]);
});

function selectAllRooms() {
    const allChecked = roomChecked.value.every(checked => checked);
    for (let i = 0; i < roomChecked.value.length; i++) {
        roomChecked.value[i] = !allChecked;
    }
}
// check檔案下載

const fileEditStatus = ref(false);
function togglefileEditStatus() {
    fileEditStatus.value = !fileEditStatus.value;
  for (let i = 0; i < roomChecked.value.length; i++) {
    roomChecked.value[i] = false;
  }
}
</script>

<template>
    <div class="download-board-mask" @click="handleSendDownloadStatus(false)">
        <div class="download-board-user-list" @click.stop>
            <h2>Uploaded by : 11161101</h2>
            <div class="download-board-mark">
                <h4 @click="togglefileEditStatus()">編輯</h4>
                <h3>檔案 / 記錄</h3>
            </div>
            <div class="download-board-file">
                <div class="download-board-file-title">
                    <p class="download-board-file-check">
                        <span v-show="fileEditStatus" @click="selectAllRooms()"><font-awesome-icon :icon="['far', 'square']" /></span>
                    </p>
                    <div class="download-board-file-detail">
                        <p class="download-board-file-name">檔案名稱</p>
                        <p class="download-board-file-date">檔案上傳日期</p>
                        <p class="download-board-file-ID">上傳身分</p>
                        <p class="download-board-file-size">檔案大小</p>
                    </div>
                </div>
                <div class="download-board-file-line"></div>
                <div class="download-board-file-title" v-for="(size, index) in fileSizeList" :key="index">
                    <p class="download-board-file-check">
                        <label :for="'checkbox' + index" v-show="fileEditStatus">
                            <input type="checkbox" :id="'checkbox' + index" :checked="roomChecked[index]"
                                @change="handleRoomCheckboxToggle(index)" />
                            <span><font-awesome-icon :icon="ckRoomIcon[index]" /></span>
                        </label>
                    </p>
                    <div class="download-board-file-detail">
                        <p class="download-board-file-name">Universal-Design-System-Web.mp4</p>
                        <p class="download-board-file-date">2024‎年‎3‎月‎7‎日 下午 08:39</p>
                        <p class="download-board-file-ID">11161101</p>
                        <p class="download-board-file-size">40.9MB</p>
                    </div>
                </div>
            </div>

            <div class="download-board-decide" v-show="fileEditStatus">
                <button class="download-board-download">Download</button>
                <button class="download-board-cancel" @click="togglefileEditStatus()">Cancel</button>
            </div>

            <span @click="handleSendDownloadStatus(false)"><font-awesome-icon icon="xmark" /></span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.download-board-mask {
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

.download-board-user-list {
    width: 990px;
    height: 570px;
    border: 6px solid #CEC8C8;
    border-radius: 7px;
    background-color: #FAFAFA;
    position: relative;
    padding: 2rem 1.5rem;

    h2 {
        font-size: 20px;
        font-weight: bold;
        color: #1E3050;
    }

    .download-board-mark {
        display: flex;
        justify-content: right;
        align-items: center;
        margin: 0 1rem 8px 0;
    }

    h3 {
        font-size: 18px;
        font-weight: bold;
        color: #615F5F;
        user-select: none;
    }

    h4 {
        font-size: 18px;
        font-weight: bold;
        color: #615F5F;
        background-color: #D9D9D9;
        border-radius: 8px;
        padding: 4px 12px;
        margin-right: 1rem;
        cursor: pointer;
    }

    .download-board-file {
        margin: 0 auto;
        padding: 1.5rem 1.5rem 0;
        width: 900px;
        height: 415px;
        background-color: #EAEAEA;
        overflow: auto;

        .download-board-file-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0 3rem 3px 0;
            font-size: 16px;
            font-weight: bold;
            color: #1E3050;

            span {
                cursor: pointer;
            }

            p {
                font-weight: bold;
            }

            .download-board-file-check {
                width: 14px;
                input[type="checkbox"] {
                    display: none;
                }
            }

            .download-board-file-detail {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                text-align: center;

                .download-board-file-name {
                    width: 310px;
                }

                .download-board-file-date {
                    width: 210px;
                }

                .download-board-file-ID {
                    width: 115px;
                }

                .download-board-file-size {
                    width: 110px;
                }
            }
        }

        .download-board-file-line {
            border-top: 2px solid #000000;
            margin-bottom: 6px;
        }
    }

    .download-board-decide {
        display: flex;
        justify-content: right;
        align-items: center;

        button {
            margin-top: 9px;
            padding: 6px 10px;
            font-size: 16px;
            font-weight: bold;
            color: #FFFFFF;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        .download-board-download {
            margin-right: 1rem;
            background-color: #3497DE;
        }

        .download-board-cancel {
            margin-right: 2rem;
            background-color: #808080;
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
}
</style>