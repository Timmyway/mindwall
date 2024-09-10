<script setup lang="ts">
interface LogoDimensions {
    width: number;
    height: number;
}

interface Props {
    authUrl: string;
    text?: string;
    logo?: LogoDimensions;
}

const props = withDefaults(defineProps<Props>(), {
    text: 'Sign in with Google',
    logo: () => {
        return {
            width: 32,
            height: 32,
        }
    },
});

const { width, height } = props.logo;
</script>

<template>
<a :href="authUrl" class="tw-google-button">
    <div>
        <img src="@/../images/google-logo.png"
         alt="G" class="google-logo" :style="{ width: `${width}px`, height: `${height}px` }">
    </div>
    <div>
        <span>{{ text }}</span>
    </div>
</a>
</template>
<style lang="scss">
.tw-google-button {
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 260px;
    font-size: 1.1rem;
    padding: 15px 20px;
    font-family: 'Roboto';
    border: 1px solid #ddd;
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
    border-radius: 40px;
    transition: all .4s;
    &:hover {
        background-color: #ffd166;
    }
}
</style>
