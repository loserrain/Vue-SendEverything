<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';

const imageUrl = ref(null);

onMounted(() => {
    axios.get('http://140.130.33.150:5279/qrcode', { responseType: 'json' })
    .then(response => {
        const imageBase64 = response.data.message;
        console.log(imageBase64)
        imageUrl.value = `data:image/png;base64,${imageBase64}`;
    })
    .catch(error => {
        console.error(error);
    });
})
</script>

<template>
    <div>
        <img :src="imageUrl" alt="Image">
    </div>
</template>