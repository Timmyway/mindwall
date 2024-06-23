import { ref } from 'vue';

export default function useSupercopy() {
    const copied = ref<string[]>([]);

    function superCopy(text: string, itemId: string) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            console.error('Clipboard API not supported or writeText method not available.');
            // Optionally, provide feedback to the user that copying is not supported
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                copied.value.push(itemId);

                // Remove copied item from copied list after 700ms
                setTimeout(() => {
                    const indexOfItemToRemove = copied.value.indexOf(itemId);
                    if (indexOfItemToRemove !== -1) {
                        console.log('Removing copied item:', itemId);
                        copied.value.splice(indexOfItemToRemove, 1);
                    }
                }, 700);
            })
            .catch(err => {
                console.error('Failed to copy text to clipboard:', err);
                // Handle clipboard write error, if needed
                // Optionally, provide feedback to the user that copying failed
            });
    }

    return { superCopy, copied }
}
