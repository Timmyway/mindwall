<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import Menubar from 'primevue/menubar';
import useMwRoutes from '@/composable/manage/useMwRoutes';
import TwNotification from '@/Components/ui/TwNotification.vue';

defineProps<{
    canLogin?: boolean;
    canRegister?: boolean;
}>();

function handleImageError() {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
}

const { items, isActive } = useMwRoutes();
</script>

<template>
    <Head title="Welcome" />
    <tw-notification pos="tr"></tw-notification>
    <div>
        <div
            class="relative min-h-screen bg-gray-200 flex flex-col selection:bg-[#FF2D20] selection:text-white"
        >
            <header class="w-full">
                <Menubar :model="items" class="w-full px-2 lg:px-4">
                    <template #start>
                        <img src="images/logo.png" alt="Mindwall" class="w-8 lg:w-24">
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

                            <Link
                                v-if="$page.props.auth.user"
                                :href="route('logout')"
                                method="post"
                                as="button"
                                class="btn bg-red-700 p-1 rounded-full text-white"
                            >
                                <i class="fas fa-power-off"></i>
                            </Link>
                        </div>
                    </template>
                </Menubar>
            </header>

            <main class="w-full">
                <slot></slot>
            </main>

            <footer class="bg-white px-4 py-2 text-sm text-black w-full mb-0 mt-auto flex flex-wrap gap-4">
                <div class="space-y-2 max-w-xs">
                    <div class="mb-4">
                        <span class="text-md text-gray-400">&copy; TimmywayCreative {{ new Date().getFullYear() }}</span>
                    </div>
                    <h6 class="mb-2 text-lg text-dark font-bold">Follow me</h6>
                    <ul class="mx-auto flex gap-4 items-center max-w-xs">
                        <li>
                            <a href="" target="_blank"><i class="fab fa-facebook"></i></a>
                        </li>
                        <li>
                            <a href="https://www.linkedin.com/in/timmyway" target="_blank"><i class="fab fa-linkedin"></i></a>
                        </li>
                        <li>
                            <a href="" target="_blank"><i class="fab fa-youtube"></i></a>
                        </li>
                    </ul>
                </div>
            </footer>
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
