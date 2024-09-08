<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { MwRoute } from '@/composable/manage/useMwRoutes';
import Menubar from 'primevue/menubar';

interface Props {
    items: MwRoute[]
    canLogin: boolean;
    canRegister: boolean;
    isActive: (urls: string[]) => boolean;
}

const props = defineProps<Props>()

const page = usePage();

const user = computed(() => {
    return page.props.auth.user;
});
</script>

<template>
<Menubar :model="items" class="w-full px-2 lg:px-4">
    <template #start>
        <img src="@/../images/logo.png" alt="Mindwall" class="w-8 lg:w-24">
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
                v-if="!user"
                :href="route('login')"
                class="btn bg-slate-900 px-3 py-0 text-white"
            >
                Log in
            </Link>

            <Link
                v-if="!user"
                :href="route('register')"
                class="btn bg-slate-900 px-3 py-0 text-white"
            >
                Register
            </Link>

            <template v-if="user">
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
</template>
