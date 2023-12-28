<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';

const imageUrl = ref(null);

onMounted(() => {
    axios.get('http://localhost:8080/api/auth/', { responseType: 'json' })
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