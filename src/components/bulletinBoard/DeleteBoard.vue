<script setup>
import { ref } from 'vue';

const emits = defineEmits(['sendDeleteStatus'])
function handleSendDeleteStatus(newStatus) {
    emits('sendDeleteStatus', newStatus)
}
</script>

<template>
    <div class="delete-board-mask">
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
@import "../../assets/styles/layout/board/deleteBoard"
</style>