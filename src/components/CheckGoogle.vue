<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    window.opener.postMessage({ isAuthenticated: true }, '*');
    window.close();
})
</script>