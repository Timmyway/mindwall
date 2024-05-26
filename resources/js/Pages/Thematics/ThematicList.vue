<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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

const loadQuotes = (): void => {

}
</script>
<template>
<div class="p-4 bg-gray-100">
    <DataTable :value="thematics">
        <Column field="id" header="ID" class="w-20"></Column>
        <Column field="name" header="Name"></Column>
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
