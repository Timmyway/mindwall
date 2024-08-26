<script setup lang="ts">
import Layout from '@/Layouts/Layout.vue';
import { InertiaPageProps } from '@/types/inertia';
import { Engine } from '@/types/thematic.types';
import { usePage } from '@inertiajs/vue3';
import { computed, onMounted, watch } from 'vue';
import TwNotification from '@/Components/ui/TwNotification.vue';
import { useNotifStore } from '@/store/notificationStore';

interface PageProps {
    prompts: Engine[];
}

const props = defineProps<PageProps>();
const page = usePage<InertiaPageProps>();

const notifStore = useNotifStore();

// Success message comes from Inertia shared mechanism.
// const successMessage = computed(() => page.props.flash.success);
onMounted(() => {
    if (page.props.flash.success) {
        notifStore.notifUser([
            { message: page.props.flash.success ?? '' },
        ])
    }
})
</script>
<template>
<Layout>
    <section class="p-4">
        <div class="mb-4 flex gap-4 items-center lg:mb-6">
            <div class="flex items-center gap-4">
                <Link
                    class="btn btn-xs text-base bg-orange-300"
                    :href="route('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                </Link>
                <h1 class="font-black lg:text-lg">Prompts</h1>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <Link
                    class="btn btn-xs text-base bg-yellow-400"
                    :href="route('prompt.add')">
                    <i class="fas fa-arrow-left"></i>
                    <span>Add</span>
                </Link>
            </div>
        </div>
        <div class="max-w-7xl min-w-xs mx-auto overflow-y-auto h-[80dvh] px-4 py-8 bg-white shadow-lg rounded-md">
            <div
                v-for="(prompt, i) in prompts" :key="`poster-${prompt.id}` ?? `poster-${i}`"
                class="py-2 my-2 border-b border-b-slate-200"
            >
                <div class="grid grid-cols-1 lg:grid-cols-12">
                    <div class="lg:col-span-9 flex items-center justify-center flex-wrap gap-4 lg:justify-start">
                        <div class="flex gap-4 items-center justify-center lg:justify-start">
                            <span class="text-xs italic">{{ prompt.id }}</span>
                            <i :class="['fas', prompt.icon_class]"></i>
                        </div>
                        <span class="text-xl text-center lg:text-left">{{ prompt.name }} <span class="text-sm text-center lg:text-left">({{ prompt.slug }})</span></span>
                    </div>
                    <div class="flex flex-col justify-center items-center gap-4 p-2 lg:col-span-3 lg:items-start">
                        <Link
                            class="btn btn-xs text-base bg-yellow-400"
                            :href="route('prompt.detail', { prompt: prompt.id, mode: 'edit' })">
                            <i class="fas fa-light-bulb"></i>
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</Layout>
</template>

<style lang="scss">
</style>
