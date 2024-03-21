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
                <button class="login-board-confirm">Confirm</button>
            </div>
            <p @click="clearPassword">Reset Password.</p>
            <span @click="handleSendLoginStatus(false)"><font-awesome-icon icon="xmark" /></span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.login-board-mask {
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

.login-board {
    width: 410px;
    height: 370px;
    border: 10px solid #DEDFE4;
    border-radius: 21px;
    background-color: #FAFAFA;
    padding: 2.6rem 2.5rem;
    position: relative;

    h1 {
        font-size: 22px;
        font-weight: bold;
        color: #1E3050;
        user-select: none;
    }

    .login-board-title {
        display: flex;
        margin: 1rem 0 1.2rem;

        div {
            display: flex;
            justify-content: space-evenly;
            flex-direction: column;
            margin-left: 8px;
            color: #1E3050;
        }

        span {
            font-size: 36px;
            color: #097FD4;
        }

        p {
            font-size: 12px;
            user-select: none;
        }

        h2 {
            font-size: 16px;
            font-weight: bold;
            user-select: auto;
        }
    }

    h3 {
        font-size: 16px;
        font-weight: bold;
        color: #1E3050;
        user-select: none;
    }

    .login-board-password-input {
        display: flex;
        align-items: center;
        position: relative;
        margin: 7px 0 1.3rem;

        span:first-child {
            position: absolute;
            left: 10px;
            font-size: 16px;
            cursor: auto;
        }

        input {
            width: 200px;
            height: 40px;
            border: 2px solid #1E3050;
            border-radius: 6px;
            font-size: 16px;
            padding-left: 2.5rem;
            margin-right: 1rem;
        }

        input[type="password"] {
            letter-spacing: 3px;
        }

        span {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 25px;
            font-size: 22px;
            color: #1E3050;
            cursor: pointer;
        }
    }

    .login-board-decide {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1.2rem;

        button {
            width: 90px;
            height: 35px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            user-select: none;
            cursor: pointer;
        }

        .login-board-cancel {
            background: none;
            color: #1E3050;
            border: 2px solid #B0B3C5;
        }

        .login-board-confirm {
            background-color: #1E3050;
            color: #FFFFFF;
            border: none;
        }
    }

    >p {
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        font-style: italic;
        text-decoration: underline;
        user-select: none;
        cursor: pointer;
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

input[type="password"]::-ms-reveal {
    display: none;
}

input[type="password"]::-ms-clear {
    display: none;
}

input[type="password"]::-o-clear {
    display: none;
}
</style>