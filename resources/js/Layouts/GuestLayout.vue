<script setup lang="ts">
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div
        class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-700 bg-no-repeat bg-left bg-cover bg-blend-multiply"
        style="background-image: url('images/pages/login/citation-1.WebP')"
    >
        <div
            class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg"
        >
            <div class="bg-white px-6 mb-6 rounded-lg flex justify-center items-center">
                <Link href="/">
                    <ApplicationLogo class="w-72 h-32 fill-current text-gray-500" />
                </Link>
            </div>
            <slot />
        </div>
    </div>
</template>
