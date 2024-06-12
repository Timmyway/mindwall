<script setup lang="ts">
import DataTable, { DataTableRowEditSaveEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { useForm } from '@inertiajs/vue3';

interface User {
    id: number;
    name: string;
    email: string;
}

// Define interface for thematic object
interface Thematic {
    id: number;
    name: string;
    user: User;
}

const props = defineProps<{
    thematics: Thematic[]
}>();

const form = useForm({
    name: ''
});

const editingRows = ref([]);

const saveThematic = (thematicId: number | string, thematicName: string) => {
    form.name = thematicName;
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

const onRowEditSave = (event: DataTableRowEditSaveEvent) => {
    let { newData, index } = event;
    console.log('event: ', event);
    saveThematic(newData.id, newData.name);
    console.log('-->', newData.name)
};
</script>
<template>
<div class="p-4 bg-gray-100">
    <DataTable
        :value="thematics"
        editMode="row"
        v-model:editing-rows="editingRows"
        @row-edit-save="onRowEditSave"
    >
        <Column field="id" header="ID" class="w-20"></Column>
        <Column field="name" header="Name">
            <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
            </template>
        </Column>
        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column header="Actions">
            <template #body="slotProps">
                <Link
                    class="btn btn-xs text-base bg-yellow-400"
                    :href="$route('thematic.detail', slotProps.data.id)">
                    <i class="fas fa-light-bulb"></i>
                    <span>Wall of mind</span>
                </Link>
            </template>
        </Column>
    </DataTable>
</div>
</template>
