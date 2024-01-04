import { defineStore } from "pinia";
import { ref } from "vue";

export const useUploadTab = defineStore('upload', () => {
    const selectedTab = ref('Send');

    function setSelectedTab(tab){
        selectedTab.value = tab
    }

    return {
        selectedTab,
        setSelectedTab
    };
});