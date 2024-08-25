<script setup lang="ts">
import Layout from '@/Layouts/Layout.vue';
import { useForm } from '@inertiajs/vue3';
import { Engine } from '@/types/thematic.types';
import TwTextInput from '@/Components/form/TwTextInput.vue';

interface Props {
    mode?: 'edit',
	prompt?: Engine; // Optional since it's not needed in 'add' mode
}

const props = defineProps<Props>();

console.log('==============>', props.mode);
console.log('==============>', props.prompt);

// Initialize form data
const form = useForm({
    id: props?.mode === 'edit' ? props.prompt?.id : null,
    name: props.prompt?.name || '',
    slug: props.prompt?.slug || '',
    blade_view: props.prompt?.blade_view || '',
    icon_class: props.prompt?.icon_class || '',
    thumbnail_url: props.prompt?.thumbnail_url || ''
});

// Function to handle form submission
const handleSubmit = () => {
    if (props?.mode === 'edit') {
        // Edit mode: Send a PUT or PATCH request to update the existing prompt
        form.put(route('prompt.update', props.prompt?.id), {
            onSuccess: () => {
                console.log('Prompt updated successfully!');
            }
        });
    } else {
        // Add mode: Send a POST request to create a new prompt
        form.post(route('prompt.store'), {
            onSuccess: () => {
                console.log('Prompt added successfully!');
            }
        });
    }
};
</script>

<template>
<Layout>
    <section class="p-4">
        <div class="mb-4 flex gap-4 items-center lg:mb-6">
            <div class="flex items-center gap-4">
                <Link
                    class="btn btn-xs text-base bg-orange-300"
                    :href="route('prompt.list')">
                    <i class="fas fa-arrow-left"></i>
                </Link>
                <h1 class="font-black lg:text-lg">
                    {{ (mode && mode === 'edit') ? 'Update' : 'Add' }} prompt
                </h1>
            </div>
        </div>
        <div class="max-w-7xl min-w-xs mx-auto overflow-y-auto h-[80dvh] px-4 py-8 bg-white shadow-lg rounded-md">
            <form class="space-y-4 lg:space-y-8" @submit.prevent="handleSubmit">
                <div class="p-1 mb-2 col-span-8">
                    <tw-text-input
                        label="Name"
                        class="tw-form-control"
                        placeholder="Partner's name"
                        v-model="form.name"
                        required
                        tabindex="1"
                    ></tw-text-input>
                </div>
                <div class="p-1 mb-2 col-span-8">
                    <tw-text-input
                        label="Slug"
                        class="tw-form-control"
                        placeholder="Slug"
                        v-model="form.slug"
                        required
                        tabindex="2"
                    ></tw-text-input>
                </div>
                <div class="p-1 mb-2 col-span-8">
                    <tw-text-input
                        label="Blade view"
                        class="tw-form-control"
                        placeholder="Blade view's filename"
                        v-model="form.blade_view"
                        required
                        tabindex="3"
                    ></tw-text-input>
                </div>
                <div class="p-1 mb-2 col-span-8">
                    <tw-text-input
                        label="Icon class"
                        class="tw-form-control"
                        placeholder="Font awesome icon class"
                        v-model="form.icon_class"
                        tabindex="4"
                    ></tw-text-input>
                </div>
                <div class="p-1 mb-2 col-span-8">
                    <tw-text-input
                        label="Thumbnail url"
                        class="tw-form-control"
                        placeholder="Thumbnail's url"
                        v-model="form.thumbnail_url"
                        tabindex="5"
                    ></tw-text-input>
                </div>

                <div class="flex my-4 gap-4">
                <button type="submit" class="btn bg-primary text-light flex items-center gap-4" tabindex="6">
                    <i class="fa fa-plus"></i>
                    <span>{{ (mode && mode === 'edit') ? 'Update' : 'Add' }} prompt's infos</span>
                </button>
                <Link class="btn btn-link" :href="$route('prompt.list')">
                    <i class="fas fa-arrow-left mr-1"></i>
                    <span>Cancel</span>
                </Link>
            </div>
            </form>
        </div>
    </section>
</Layout>
</template>

<style lang="scss">
.tw-form-control {
    box-sizing: border-box;
    width: 100%;
    font-size: 1rem;
    padding: 15px 8px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    border: 1px solid #aaaaaa;
    border-radius: 4px;
    background-color: #fff;
    color: #333;
}

@media (min-width: 768px) {
    .tw-form-control {
        font-size: 1.6rem;
        padding: 8px 11px;
    }
}
</style>
