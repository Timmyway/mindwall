<script setup lang="ts">
import Layout from '@/Layouts/Layout.vue';
</script>

<template>
    <layout>
        <div class="py-5">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 text-gray-900">
                <div class="bg-white shadow-sm sm:rounded-lg">
                    <div class="p-6">Welcome {{ $page.props.auth.user.name }}</div>

                    <div v-if="$page.props.auth.permissions.prompt.view" class="px-8 py-4">
                        <h2 class="font-bold text-2xl text-indigo-600">Manage prompt</h2>
                        <div class="py-4 space-y-4">
                            <Link
                                class="btn btn-xs text-base bg-yellow-400"
                                :href="route('prompt.list')">
                                <i class="fas fa-light-bulb"></i>
                                <span>Manage prompts</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </layout>
</template>
