import { ref } from 'vue';

export default function useSupercopy() {
    const copied = ref<string[]>([]);

    function superCopy(text: string, itemId: string) {
        navigator.clipboard.writeText(text);
        copied.value.push(itemId);
        setTimeout(() => {
            console.log('====> Remove copied item from copied list');
            const indexOfItemToRemove = copied.value.indexOf(itemId);
            console.log('Found item index: ', indexOfItemToRemove);
            copied.value.splice(indexOfItemToRemove, 1);
        }, 700);
    }

    return { superCopy, copied }
}
