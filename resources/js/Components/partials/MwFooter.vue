<script setup lang="ts">
import { SocialMedia } from '@/types/website.types';

interface Props {
    brandName?: string;
    socialMedias: SocialMedia[];
    sMHeading?: string;
}

const props = withDefaults(defineProps<Props>(), {
    brandName: 'Devambition',
    sMHeading: 'Follow me',
});
</script>

<template>
<footer class="bg-white px-4 py-2 text-sm text-black w-full mb-0 mt-auto flex flex-wrap gap-4">
    <div class="space-y-2 max-w-xs">
        <div class="mb-4">
            <span class="text-md text-gray-400">&copy; {{ brandName }} {{ new Date().getFullYear() }}</span>
        </div>
        <h6 class="mb-2 text-lg text-dark font-bold">{{ sMHeading }}</h6>
        <ul class="mx-auto flex gap-4 items-center max-w-xs">
            <li v-for="media in socialMedias" :key="media.id">
                <a :href="media.url" :target="media.newTab ? '_blank' : ''">
                    <template v-if="media.icon">
                        <i :class="media.icon"></i>
                    </template>
                    <template v-else>
                        {{ media.name }}
                    </template>
                </a>
            </li>
        </ul>
    </div>
</footer>
</template>
