<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import Menubar from 'primevue/menubar';
import useMwRoutes from '@/composable/manage/useMwRoutes';
import useMwFooter from '@/composable/manage/useMwFooter';
import TwNotification from '@/Components/ui/TwNotification.vue';
import MwFooter from '@/Components/partials/MwFooter.vue';

defineProps<{
    canLogin?: boolean;
    canRegister?: boolean;
    noStyle?: boolean;
}>();

function handleImageError() {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
}

const { items, isActive } = useMwRoutes();
const { socialMedias } = useMwFooter();
</script>

<template>
    <Head title="Welcome" />
    <tw-notification pos="tr"></tw-notification>
    <div>
        <div
            :class="[noStyle ? '' : 'relative min-h-screen bg-gray-200 flex flex-col selection:bg-[#FF2D20] selection:text-white']"
        >
            <header class="w-full">
                <Menubar :model="items" class="w-full px-2 lg:px-4">
                    <template #start>
                        <img src="../../images/logo.png" alt="Mindwall" class="w-8 lg:w-24">
                    </template>
                    <template #item="{ item }">
                        <Link
                            v-if="(!item.private) || (item.private && $page.props.auth.user)"
                            class="flex items-center gap-2 ml-6 font-bold"
                            :class="{'item--active': isActive(item?.urls ?? '')}"
                            v-ripple
                            :href="item.urls[0] ?? ''"
                        >
                            <i :class="item.icon"></i>
                            <span>{{ item.label }}</span>
                        </Link>
                    </template>
                    <template #end>
                        <div class="flex items-center gap-2">
                            <Link
                                v-if="!$page.props.auth.user"
                                :href="route('login')"
                                class="btn bg-slate-900 px-3 py-0 text-white"
                            >
                                Log in
                            </Link>

                            <Link
                                v-if="canRegister"
                                :href="route('register')"
                                class="btn bg-slate-900 px-3 py-0 text-white"
                            >
                                Register
                            </Link>

                            <template v-if="$page.props.auth.user">
                                <span class="whitespace-nowrap max-w-16 overflow-hidden text-ellipsis">{{ $page.props.auth.user.name }}</span>
                                <Link
                                    :href="route('logout')"
                                    method="post"
                                    as="button"
                                    class="btn bg-red-700 p-1 rounded-full text-white"
                                >
                                    <i class="fas fa-power-off"></i>
                                </Link>
                            </template>
                        </div>
                    </template>
                </Menubar>
            </header>

            <main class="w-full">
                <slot></slot>
            </main>

            <mw-footer :social-medias="socialMedias"></mw-footer>
        </div>
    </div>
</template>

<style>
.item--active {
    color: #ffd166;
    background: -webkit-linear-gradient(#ffd166, #af7f10);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>
