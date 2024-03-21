<script setup>
import { ref, watchEffect, computed, watch } from "vue";

const emits = defineEmits(["sendCreateStatus"]);

const inputTitle = ref("");
const inputDescription = ref("");
const inputPwd = ref("");

function handleSendCreateStatus(newStatus) {
  emits("sendCreateStatus", newStatus);
  inputTitle.value = "";
  inputDescription.value = "";
  inputPwd.value = "";
}

function handleCreate(room) {
  console.log("Room Data: ", room);
}

const isPublicChecked = ref(false);
const isPrivateChecked = ref(false);

const ckPublicIcon = computed(() => {
  return isPublicChecked.value ? ["far", "square-check"] : ["far", "square"];
});

const ckPrivateIcon = computed(() => {
  return isPrivateChecked.value ? ["far", "square-check"] : ["far", "square"];
});

watch(isPublicChecked, (newValue) => {
  if (newValue) {
    isPrivateChecked.value = false;
  }
});

watch(isPrivateChecked, (newValue) => {
  if (newValue) {
    isPublicChecked.value = false;
  }
});
</script>

<template>
  <div class="create-board-mask" @click="handleSendCreateStatus(false)">
    <div class="create-board" @click.stop>
      <p>ROOM SETUP</p>
      <div class="create-board-line"></div>
      <div class="create-board-form">
        <form @submit="handleCreate">
          <div class="create-board-title">
            <p>Title</p>
            <label for="title"></label>
            <input type="text" name="title" id="title" v-model="inputTitle" />
          </div>

          <div class="create-board-description">
            <p>Room description</p>
            <label for="description"></label>
            <textarea
              name="description"
              id="description"
              cols="41"
              rows="3"
              v-model="inputDescription"
            ></textarea>
          </div>

          <p>Password setting</p>
          <div class="create-board-pwd">
            <label for="pwd"></label>
            <input type="password" name="pwd" id="pwd" v-model="inputPwd" />
          </div>

          <div class="create-board-checkbox">
            <label for="checkbox1">
              <input
                type="checkbox"
                name="checkbox1"
                id="checkbox1"
                v-model="isPublicChecked"
              />
              <span><font-awesome-icon :icon="ckPublicIcon" /></span>
              Public
            </label>
            <label for="checkbox2">
              <input
                type="checkbox"
                name="checkbox2"
                id="checkbox2"
                v-model="isPrivateChecked"
              />
              <span><font-awesome-icon :icon="ckPrivateIcon" /></span>
              Private
            </label>
          </div>
        </form>

        <div class="create-board-Select">
          <div class="create-board-img">
            <p>File Preview</p>
          </div>
          <div class="create-board-file">
            <label type="button" for="fileInput"> Select File </label>
            <input type="file" name="fileInput" id="fileInput" />
          </div>
        </div>
      </div>

      <div class="create-board-decide">
        <button class="create-board-cancel" @click="handleSendCreateStatus(false)">Cancel</button>
        <button class="create-board-confirm">Confirm</button>
      </div>
      <span @click="handleSendCreateStatus(false)"><font-awesome-icon icon="xmark" /></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.create-board-mask {
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

.create-board {
  width: 700px;
  height: 360px;
  border: 8px solid #dedfe4;
  border-radius: 21px;
  background-color: #fafafa;
  padding: 1.5rem 2rem 4px 1.2rem;
  position: relative;

  > p {
    font-size: 22px;
    font-weight: bold;
    color: #5a5858;
  }

  .create-board-line {
    border-top: 3px solid #b9b5b5;
    border-radius: 10px;
    margin: 4px 2rem 12px 0;
  }

  .create-board-form {
    display: flex;
    justify-content: space-between;

    p {
      font-size: 18px;
      font-weight: bold;
      color: #506d74;
      letter-spacing: 0.8px;
      margin: 10px 0 2px;
    }

    input {
      outline: none;
    }
    .create-board-title {
      input {
        width: 380px;
        height: 25px;
        font-size: 14px;
        border: 2px solid #4e96a7;
        border-radius: 4px;
      }
    }

    .create-board-description {
      textarea {
        resize: none;
        outline: none;
        width: 380px;
        color: #868686;
        font-size: 14px;
        background-color: #f8faff;
        border: 2px solid #bbbbbb;
        border-radius: 4px;
      }
    }

    .create-board-pwd {
      display: inline-block;
      input {
        width: 190px;
        height: 25px;
        font-size: 14px;
        border: 2px solid #4e96a7;
        border-radius: 4px;
        margin: 2px 12px 0 0;
      }
    }

    .create-board-checkbox {
      display: inline-block;
      font-size: 15px;
      color: #1e3050;

      label {
        margin-right: 8px;
        font-weight: bold;
      }

      input[type="checkbox"] {
        display: none;
      }
    }

    .create-board-Select {
      margin-top: 1rem;

      .create-board-img {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 185px;
        height: 175px;
        background-color: #f8faff;
        border: 2px solid #bbbbbb;

        p {
          font-size: 16px;
          font-weight: bold;
          color: #c6cbcc;
        }
      }

      .create-board-file {
        display: flex;
        justify-content: center;
        label {
          display: inline-block;
          margin-top: 12px;
          padding: 6px 14px;
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          background-color: #2dbbf9;
          border: none;
          border-radius: 2px;
        }

        input {
          display: none;
        }
      }
    }
  }
  .create-board-decide {
    text-align: center;

    button {
        font-size: 14px;
        font-weight: bold;
        padding: 6px 14px;
        margin: 0 1rem;
        cursor: pointer;
    }

    .create-board-cancel {
      background: none;
      border: 2px solid #b0b3c5;
      border-radius: 4px;
    }

    .create-board-confirm {
      background: #004de4;
      border: none;
      border-radius: 4px;
      color: #FFFFFF;
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
