<script setup>
import { ref, computed } from 'vue';

const emits = defineEmits(["sendLoginStatus"]);

function handleSendLoginStatus(newStatus) {
    emits("sendLoginStatus", newStatus);
}

const pwd = ref("");

function clearPassword() {
    pwd.value = '';
}

const flag = ref(false);
function togglePasswordVisibility() {
    flag.value = !flag.value;
}
const inputType = computed(() => {
    return flag.value ? "text" : "password"
})
const elIcon = computed(() => {
    return flag.value ? ['far', 'eye'] : ['far', 'eye-slash']
})

</script>

<template>
    <div class="login-board-mask" @click="handleSendLoginStatus(false)">
        <div class="login-board" @click.stop>
            <h1>Enter Your Password.</h1>
            <div class="login-board-title">
                <span><font-awesome-icon icon="house-user" /></span>
                <div>
                    <p>One for all room.</p>
                    <h2>XBF4CR</h2>
                </div>
            </div>
            <h3>Password</h3>
            <div class="login-board-password-input">
                <span><font-awesome-icon icon="lock" /></span>
                <label for="pwd"></label>
                <input v-model="pwd" name="pwd" id="pwd" :type="inputType">
                <span @click="togglePasswordVisibility"><font-awesome-icon :icon="elIcon" /></span>
            </div>
            <div class="login-board-decide">
                <button class="login-board-cancel" @click="handleSendLoginStatus(false)">Cancel</button>
                <RouterLink to="/BulletinBoard/roomboard/1">
                    <button class="login-board-confirm">Confirm</button>
                </RouterLink>
            </div>
            <p @click="clearPassword">Reset Password.</p>
            <span @click="handleSendLoginStatus(false)"><font-awesome-icon icon="xmark" /></span>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "../../assets/styles/layout/board/loginBoard"
</style>