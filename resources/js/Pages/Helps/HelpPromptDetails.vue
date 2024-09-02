<script setup lang="ts">
import Layout from '@/Layouts/Layout.vue';
import DocDevFeather from './docs/DocDevFeather.vue';
import DocAllRounder from './docs/DocAllRounder.vue';
import DocEnglishProf from './docs/DocEnglishProf.vue';

interface Props {
    doc: string;
}

const props = withDefaults(defineProps<Props>(), {
    
});

</script>

<template>
<Layout no-style>
    <div class="m-1">
        <Link
            :href="route('help.prompts')"
            class="btn btn-icon--xs btn-icon--flat btn-icon py-1"
        >
            <i class="fas fa-chevron-left text-red-600"></i>
        </Link>
    </div>
    <div class="tw-doc p-4">
        <template v-if="doc === 'dev-feather'">
            <doc-dev-feather></doc-dev-feather>
        </template>
        <template v-if="doc === 'descriptor'">
            <doc-all-rounder></doc-all-rounder>
        </template>
        <template v-if="doc === 'english-prof'">
            <doc-english-prof></doc-english-prof>
        </template>
    </div>
</Layout>
</template>

<style lang="scss">
.tw-doc {
    max-width: 1100px;
    margin: auto;
    line-height: 1.7;
    &__content {
        max-height: 480px;
        overflow: auto;
        scrollbar-width: thin
    }
    h1 {
        font-weight: bold;
        padding: 15px 0;
        font-size: 1.5rem;
    }
    h2 {
        font-weight: bold;
        padding: 15px 0;
        font-size: 1.2rem;
    }
    p {
        padding: 10px;
        line-height: 1.7;
        color: #444444;
    }
    strong {
        font-weight: bold;        
    }
    ul {
        display: flex;
        flex-direction: column;
        gap: 10px;        
    }
    li {
        padding: 5px 0;
        list-style-type: square;
    }
    code {
        background: #f4f4f4;
        padding: 2px 5px;
        border-radius: 4px;
    }
    hr {
        border: 2px solid #BBB;
        max-width: 80%;
        margin: 25px 0;
        border-radius: 8px;
    }
}

</style>