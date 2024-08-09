import { useForm } from "@inertiajs/vue3";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useThematicStore = defineStore('thematics', () => {
    const form = useForm({
        name: '',
    });

    const oldValues = ref({
        name: ''
    });

    const backupOldValues = () => {
        oldValues.value = { ...form };
    }

    const restoreOldValues = () => {
        Object.assign(form, oldValues);
    }

    const resetOldValues = () => {
        Object.assign({ name: '' }, oldValues);
    }

    const edit = (thematicId: number | string) => {
        form.put(`thematics/${thematicId}`, {
            preserveState: true,
            onSuccess: () => {
                console.log('-->', form.name);
                // Optionally, handle success actions
            },
            onError: (errors) => {
                console.error('Update failed: ', errors);
                // Optionally, handle error actions
            }
        });
    }

    return { form, edit, oldValues, backupOldValues, restoreOldValues, resetOldValues }
});
