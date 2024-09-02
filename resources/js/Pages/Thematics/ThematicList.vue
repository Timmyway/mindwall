<script setup lang="ts">
import Layout from '@/Layouts/Layout.vue';
import TwWallPoster from '@/Components/wall/TwWallPoster.vue';
import TwPagination from '@/Components/ui/TwPagination.vue'
import { useForm } from '@inertiajs/vue3';
import { ThematicForm } from '@/types/thematic.types';
import TwAlert from '@/Components/ui/TwAlert.vue';
import { MwLayerConfig } from '@/types/konva.config';
import useBasicOperations from '@/composable/canvas/useBasicOperations';

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

// Define interface for paginated response
interface PaginatedThematics {
    data: Thematic[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: PaginationLink[]
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;    
}

const props = defineProps<{
    thematics: PaginatedThematics
}>();

const form = useForm<ThematicForm>({
    name: '',
    wall: { layers: [] }
});

const { setupNewLayer } = useBasicOperations();

const newWall = () => {
    const name = prompt('Give a name to your new wall');
    if (typeof name !== 'string' || name?.length < 2) {
        return;
    }
    form.name = name;
    const { newLayer } = setupNewLayer();
    form.wall.layers.push(newLayer);
    form.post('thematics');
}

const closeError = (key: string) => {    
    console.log('---------> Close key: ', key);
    if (form.errors && key in form.errors) {        
        form.errors[key as keyof ThematicForm] = '';
    }
}
</script>
<template>
<Layout>
    <div class="px-4 tw-thematic-list">                
        <div
            v-for="(errorMessage, errorKey)  in form.errors"
            class="absolute top-0 right-0  z-50 flex flex-col gap-2 mt-1 px-2 max-w-sm max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
            <tw-alert
                :show="(typeof errorMessage === 'string' && errorMessage?.trim()?.length > 0) ? true : false"
                kind="error"
                @close="closeError(errorKey ?? '')"
            >
                <span>{{ errorMessage }}</span>
            </tw-alert>
        </div>        
        <div class="tw-thematic-list__action-bar mt-2 mb-2">            
            <div class="py-1 px-4 bg-white shadow rounded-sm max-w-xs mx-auto flex gap-4 items-center">
                <button class="btn btn-icon btn-xs btn-icon--flat bg-yellow-400 w-8 h-8 p-2" @click="newWall">
                    <i class="fas fa-plus-circle fa-2x"></i>
                </button>
                <tw-pagination class="justify-center" :links="thematics.links"></tw-pagination>
            </div>
        </div>
        <div class="tw-thematic-list__posters px-4 py-2">
            <tw-wall-poster :posters="thematics.data"></tw-wall-poster>        
        </div>
    </div>
</Layout>
</template>

<style lang="scss">
.tw-thematic-list {
    min-height: 100vh;
    max-height: 100vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;
    &__action-bar {
        position: sticky;
        top: 0;
        z-index: 2;
    }    
    background:
        linear-gradient(#062FD9 0%, #FD000D 90%),
        linear-gradient(to right, #A7F200 0%, #560CBE 60%),
        url('images/pages/thematics/wall.WebP') 30px,
        url('images/pages/thematics/wall.WebP') 20px;
        background-blend-mode: multiply, difference, lighten;    
}
</style>
