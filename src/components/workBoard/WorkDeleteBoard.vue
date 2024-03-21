<script setup>
import { ref } from 'vue';

const emits = defineEmits(['sendDeleteStatus'])
function handleSendDeleteStatus(newStatus) {
    emits('sendDeleteStatus', newStatus)
}
</script>

<template>
    <div class="delete-board-mask" @click="handleSendDeleteStatus(false)">
        <div class="delete-board" @click.stop>
            <p><font-awesome-icon icon="trash-can" /></p>
            <h2>Delete File</h2>
            <h3>Are you sure you want to delete this file?</h3>
            <h3>This action cannot be undone.</h3>
            <div class="delete-board-decide">
                <button class="delete-board-cancel" @click="handleSendDeleteStatus(false)">Cancel</button>
                <button class="delete-board-confirm">Delete</button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.delete-board-mask {
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

.delete-board {
    text-align: center;
    width: 459px;
    height: 270px;
    background-color: #FAFAFA;
    border: 6px solid #DEDFE4;
    border-radius: 40px;
    padding: 1.5rem 0;

    p {
        display: inline-block;
        font-size: 28px;
        color: #F24646;
        background-color: #F7D5D7;
        border-radius: 50px;
        padding: 5px 9px;
    }

    h2 {
        font-size: 24px;
        font-weight: bold;
        margin: 1rem 0;
    }

    h3 {
        font-size: 14px;
        font-weight: bold;
        color: #615F5F;
    }

    .delete-board-decide {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;

        button {
            width: 141px;
            height: 41px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }

        .delete-board-cancel {
            background-color: #F0F0F0;
        }

        .delete-board-confirm {
            color: #F0F0F0;
            background-color: #F24646;
        }
    }
}
</style>