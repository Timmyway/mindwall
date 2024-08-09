<script setup lang="ts">
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import TwAuthorCredit from '@/Components/media/TwAuthorCredit.vue';
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div
        class="min-h-screen flex flex-col items-center pt-6 sm:pt-0 bg-slate-500 bg-no-repeat bg-center bg-cover bg-blend-multiply"
        style="background-image: url('images/pages/login/human-x-machine.WebP')"
    >
        <tw-author-credit dark>
            <!-- Image de rawpixel.com -->
        </tw-author-credit>
        <div
            class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg"
        >
            <div class="bg-white px-6 mb-6 rounded-lg flex flex-col justify-center items-center text-center">
                <Link href="/">
                    <ApplicationLogo class="w-72 h-32 fill-current text-gray-500" />
                </Link>
                <span class="text-sm mt-2 mb-4">presents</span>
                <span class="text-2xl font-black">MINDWALL</span>
            </div>
            <slot />
        </div>
    </div>
</template>
