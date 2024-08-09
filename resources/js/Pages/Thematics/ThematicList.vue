<script setup lang="ts">
import Layout from '../../Layouts/Layout.vue'
import DataTable, { DataTableRowEditSaveEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { useForm } from '@inertiajs/vue3';
import TwWallPoster from '@/Components/wall/TwWallPoster.vue';

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
</script>
<template>
<Layout>
    <div class="p-4 tw-thematic-list h-screen">
        <!--
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
        -->
        <tw-wall-poster :posters="thematics"></tw-wall-poster>
    </div>
</Layout>
</template>

<style lang="scss">
.tw-thematic-list {
    background:
        linear-gradient(#062FD9 0%, #FD000D 90%),
        linear-gradient(to right, #A7F200 0%, #560CBE 60%),
        url('images/pages/thematics/wall.WebP') 30px,
        url('images/pages/thematics/wall.WebP') 20px;
        background-blend-mode: multiply, difference, lighten;
}
</style>
