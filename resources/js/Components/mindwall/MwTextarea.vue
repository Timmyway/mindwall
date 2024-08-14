<script setup lang="ts">
import { useTextEditStore } from '@/store/textEditStore';
import { storeToRefs } from 'pinia';

const editStore = useTextEditStore();
const { quoteAreaRef, editing, editedQuoteText, textareaStyle } = storeToRefs(editStore);
</script>

<template>
<textarea
    v-show="editing"
    ref="quoteAreaRef"
    class="quote-textarea"
    type="text"
    v-model="editedQuoteText"
    @blur="editStore.editQuote($event)"
    @keyup.enter="editStore.editQuote($event)"
    @keyup.escape="editStore.exitEditMode"
    :style="textareaStyle"
></textarea>
</template>

<style>
.quote-textarea {
    padding: 15px 10px;
    outline: none;
    margin: 0px;
    overflow: auto;
    background: none;
    border-radius: 12px;
    border: none;
    resize: none;
    top: 0; left: 50%;
    transform: translate(-50%, 0);
    max-width: 360px;
}
</style>
