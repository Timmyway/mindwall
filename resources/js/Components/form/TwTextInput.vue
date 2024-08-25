<template>
<label class="font-bold">
    {{ label }} {{ counter ? `(${modelValue?.length})` : '' }}
</label>
<div class="flex items-center">
    <input
        v-bind="$attrs"
        :placeholder="placeholder ? placeholder : label"
        :value="modelValue"
        @keydown.prevent.enter=""
        @input="updateValue"
    >
    <div class="bg-gray-200 h-full p-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg hover:bg-red-400">
        <button @click.prevent="$emit('update:modelValue', '')">
            <i class="fas fa-times opacity-50 hover:opacity-100"></i>
        </button>
    </div>
</div>
</template>

<script setup>
const props = defineProps({
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    modelValue: {
        type: [String, Number],
        default: ''
    },
    counter: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

function updateValue(e) {
    emit('update:modelValue', e.target.value);
}
</script>

<style>
input::placeholder {
    color: #CCC;
}
</style>
