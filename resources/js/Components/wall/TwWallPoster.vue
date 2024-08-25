<script setup lang="ts">
import useRandomColor from '@/composable/useRandomColor';
import { useThematicStore } from '@/store/thematicStore';
import { Thematic } from '@/types/thematic.types';
import { onMounted, onUnmounted, ref } from 'vue';
import { debounce } from 'lodash';

interface Props {
    posters: any[];
    color?: string;
}

const props = withDefaults(defineProps<Props>(), {
    color: 'gray'
});

const thematicStore = useThematicStore();

const { getRandomColor } = useRandomColor();

const posterNameInputRefs = ref<HTMLInputElement[]>();
const isEditMode = ref<boolean>(false);
const currentThematicId = ref<number>();

const enterEditMode = (thematic: Thematic, thematicIndex: number) => {
    currentThematicId.value = thematic.id;
    Object.assign(thematicStore.form, thematic);
    console.log('==> Enter edit mode.')
    setTimeout(() => {
        if (posterNameInputRefs.value && posterNameInputRefs.value?.length > 0) {
            console.log('==>', posterNameInputRefs.value, thematicIndex)
            posterNameInputRefs.value[thematicIndex].focus();
        } else {
            console.log('===> No input element found.')
        }
    }, 200)
    isEditMode.value = true;
}
const exitEditMode = () => {
    thematicStore.form.reset();
    currentThematicId.value = 0;
    isEditMode.value = false;
}
const editThematic = () => {
    if (currentThematicId.value) {
        thematicStore.edit(currentThematicId.value);
    }
    exitEditMode();
}

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isEditMode.value) {
        exitEditMode();
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div class="flex justify-center gap-10 flex-wrap">
        <div v-for="(poster, i) in posters" :key="`poster-${poster.id}` ?? `poster-${i}`">
            <div class="tw-wall-poster text-slate-900 flex flex-col gap-2 transition-all" :style="{ backgroundColor: getRandomColor(), cursor: isEditMode ? 'initial' : 'pointer' }">
                <div class="bg-white mb-auto w-full flex justify-end py-2">
                    <div class="px-2 h-6 flex items-center">
                        <button v-show="!isEditMode" @click.prevent="enterEditMode(poster, i)">
                            <i class="fas fa-edit text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-4 p-2 h-[280px]">
                    <span class="text-2xl lg:text-6xl">{{ poster.id }}</span>
                    <div v-show="isEditMode && (currentThematicId === poster.id)" class="flex items-center gap-2 flex-wrap">
                        <input ref="posterNameInputRefs" class="tw-wall-poster__input w-full text-2xl lg:text-3xl" v-model="thematicStore.form.name" />
                        <div class="mt-6 mb-4 flex w-full justify-center items-center gap-4 px-2">
                            <button class="group bg-green-300 w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-green-400" @click.prevent="editThematic()">
                                <i class="fas fa-check text-4xl mx-5 group-hover:scale-x-110 transition-all"></i>
                            </button>
                            <button class="group bg-pink-300 w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-pink-400" @click.prevent="exitEditMode()">
                                <i class="fas fa-times text-4xl mx-5 group-hover:scale-x-110 transition-all"></i>
                            </button>
                        </div>
                    </div>
                    <div v-show="!isEditMode || (currentThematicId !== poster.id)">
                        <h6 class="tw-wall-poster__title pt-6 text-2xl lg:text-4xl">{{ poster.name }}</h6>
                    </div>
                </div>
                <div class="flex flex-col gap-4 p-2">
                    <a
                        class="btn btn-xs text-base bg-yellow-400"
                        :href="route('thematic.detail', poster.id)">
                        <i class="fas fa-light-bulb"></i>
                        <span>Wall of mind</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.tw-wall-poster {
    // max-width: 320px;
    // min-width: 260px;
    width: 320px;
    max-width: 320px;
    text-align: center;
    display: flex; justify-content: center; align-items: center;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.9;
    &__title {
        font-family: "Paytone One", sans-serif;
    }
    &__input {
        box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
        padding: 10px 15px;
        border-radius: 8px;
    }
    &:hover {
        opacity: 1;
    }
}
</style>
