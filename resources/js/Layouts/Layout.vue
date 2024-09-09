<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import useMwFooter from '@/composable/manage/useMwFooter';
import TwNotification from '@/Components/ui/TwNotification.vue';
import MwFooter from '@/Components/partials/MwFooter.vue';
import useMwRoutes from '@/composable/manage/useMwRoutes';
import TwNavbar from '@/Components/menu/TwNavbar.vue';

defineProps<{
    canLogin?: boolean;
    canRegister?: boolean;
    noStyle?: boolean;
}>();

const { items, isActive } = useMwRoutes();
const { socialMedias } = useMwFooter();

function handleImageError() {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
}
</script>

<template>
    <Head title="Welcome" />
    <tw-notification pos="tr"></tw-notification>
    <div>
        <div
            :class="[noStyle ? 'flex flex-col border-2' : 'relative min-h-screen bg-gray-200 flex flex-col selection:bg-[#FF2D20] selection:text-white']"
        >
            <header class="w-full">
                <tw-navbar
                    :can-login="canLogin ?? false"
                    :can-register="canRegister ?? false"
                    :items="items"
                    :is-active="isActive"
                ></tw-navbar>
            </header>

            <main class="w-full flex-1">
                <slot></slot>
            </main>

            <mw-footer :social-medias="socialMedias"></mw-footer>
        </div>
    </div>
</template>
