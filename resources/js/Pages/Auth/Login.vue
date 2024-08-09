<script setup lang="ts">
import Checkbox from '@/Components/Checkbox.vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps<{
    canResetPassword?: boolean;
    status?: string;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => {
            form.reset('password');
        },
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Log in" />

        <div v-if="status" class="mb-4 font-medium text-sm text-green-600">
            {{ status }}
        </div>

        <form @submit.prevent="submit">
            <div>

                <div class="flex items-center gap-2">
                    <div class="px-2">
                        <i class="fas fa-envelope text-lg"></i>
                    </div>
                    <InputLabel class="text-lg" for="email" value="Email" />
                </div>
                <TextInput
                        id="email"
                        type="email"
                        class="mt-1 block bg-gray-200 w-full focus:bg-gray-50 focus:shadow-lg"
                        v-model="form.email"
                        required
                        autofocus
                        autocomplete="username"
                    />

                <InputError class="mt-2" :message="form.errors.email" />
            </div>

            <div class="mt-5">

                <div class="flex items-center gap-2">
                    <div class="px-2">
                        <i class="fas fa-lock text-lg"></i>
                    </div>
                    <InputLabel class="text-lg" for="password" value="Password" />
                </div>
                <TextInput
                    id="password"
                    type="password"
                    class="mt-1 block bg-gray-200 w-full focus:bg-gray-50 focus:shadow-lg"
                    v-model="form.password"
                    required
                    autocomplete="current-password"
                />
                <InputError class="mt-2" :message="form.errors.password" />
            </div>

            <div class="block mt-4">
                <label class="flex items-center">
                    <Checkbox name="remember" v-model:checked="form.remember" />
                    <span class="ms-2 text-sm text-gray-600">Remember me</span>
                </label>
            </div>

            <div class="flex items-center justify-end mt-4">
                <Link
                    v-if="canResetPassword"
                    :href="route('password.request')"
                    class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Forgot your password?
                </Link>

                <PrimaryButton class="w-full px-4 py-3 rounded-lg text-theme mt-2 text-2xl justify-center" :class="{ 'opacity-25': form.processing }" :disabled="form.processing">
                    Let's go!
                </PrimaryButton>
            </div>
        </form>
    </GuestLayout>
</template>
