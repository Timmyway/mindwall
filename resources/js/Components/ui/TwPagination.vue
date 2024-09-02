<script setup lang="ts">
interface Props {
    links: any[];
    minItems?: number;
}
const props = withDefaults(defineProps<Props>(), {
    minItems: 3
});
// Display pagination components when items >= minItems.
</script>

<template>
<div v-if="links.length > minItems">
    <div class="tw-pagination-container" v-bind="$attrs">
        <div
            v-for="(link, index) in links" :key="index"
        >
            <div v-if="link.url === null"
                class="tw-pagination--disabled"
                v-html="link.label"
            ></div>
            <Link
                v-else
                class="tw-pagination" :class="{ 'active-page': link.active }"
                :href="link.url" v-html="link.label"
            />
        </div>
    </div>
</div>
</template>
  
<style lang="scss">
/* Pagination */
.tw-pagination--disabled {    
    color: #aaa;
}

.tw-pagination-container {
    flex-wrap: wrap;    
    align-items: center;
    gap: 10px;
    display: flex;
}
.tw-pagination {
    padding: 5px 5px;
    font-size: 1rem;
    &:hover {
        font-weight: bold;
    }
    &:focus {
        border: 2px solid #29335C;
        color: #29335C;
    }
}

.active-page {
    background: lighten(#ffd166, 5%);
    border-radius: 100%;
    width: 32px; height: 32px;
    font-weight: bold;
    display: flex; justify-content: center; align-items: center;
}
</style>