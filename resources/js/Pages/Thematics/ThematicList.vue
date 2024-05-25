<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

interface Thematic {
    id: number;
    name: string;
}

const props = defineProps<{
    thematics: []
}>();
</script>
<template>
<div class="p-4 bg-gray-100">
    <DataTable :value="thematics">
        <Column field="id" header="ID" class="w-20"></Column>
        <Column field="name" header="Name"></Column>
    </DataTable>
</div>
</template>
