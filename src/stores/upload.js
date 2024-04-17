import { defineStore } from "pinia";
import { ref } from "vue";

export const useUploadInfo = defineStore('upload', () => {
    const selectedTab = ref('Send');
    function setSelectedTab(tab){
        selectedTab.value = tab
    }

    const textReceiveCode = ref(false);
    function setTextReceiveCode(code){
        textReceiveCode.value = code
    }

    const textReceiveResult = ref('');
    function setTextReceiveResult(result){
        textReceiveResult.value = result
    }

    const textReceiveStatus = ref(false);
    function setTextReceiveStatus(status){
        textReceiveStatus.value = status
    }

    return {
        selectedTab,
        setSelectedTab,
        textReceiveCode,
        setTextReceiveCode,
        textReceiveResult,
        setTextReceiveResult,
        textReceiveStatus,
        setTextReceiveStatus
    };
});