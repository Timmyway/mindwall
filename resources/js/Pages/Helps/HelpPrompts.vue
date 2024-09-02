<script setup lang="ts">
import Layout from '@/Layouts/Layout.vue';

interface Engine {
    id: string;
    name: string;
    slug: string;
}

interface Props {
    engines: Engine[];
}

const props = withDefaults(defineProps<Props>(), {
    
});

</script>

<template>
<Layout>
    <div class="p-4 flex flex-col max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold py-4">Help for best usage of available Prompts</h2>
        <div>
            <ul class="max-h-[80dvh] overflow-y-auto flex flex-col gap-2 scrollbar-thin">
                <li
                    v-for="engine in engines" :key="engine.id"
                    class="py-2"
                >
                    <Link :href="route('help.prompts.detail', { doc: engine.slug })" class="underline">
                        {{ engine.name }} - <span class="text-xs italic text-gray-500">{{  engine.slug }}</span>
                    </Link>
                </li>
            </ul>
        </div>
    </div>
</Layout>
</template>