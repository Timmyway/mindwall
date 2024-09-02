<script setup lang="ts">
import { NotifIconClass, NotifKind } from '@/types/notification';

interface Props {    
    show?: boolean;
    kind?: NotifKind;
    message?: string;
}

const props = withDefaults(defineProps<Props>(), {
    message: '',
    show: false,
    kind: 'success'
});

const setIconClass = (): NotifIconClass => {
    let iconClass: NotifIconClass;
    switch (props.kind) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            break;
        case 'error':
            iconClass = 'fas fa-times-circle';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-circle';
            break;
        case 'info':
            iconClass = 'fas fa-info-circle';
            break;
        case 'primary':
            iconClass = 'fas fa-star';
            break;
        case 'secondary':
            iconClass = 'fas fa-thumbs-up';
            break;
        case 'light':
            iconClass = 'fas fa-lightbulb';
            break;
        case 'dark':
            iconClass = 'fas fa-moon';
            break;
        default:
            iconClass = 'fas fa-check-circle'; // Default case if no kind matches
            break;
    }
    return iconClass;
}

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
}
</script>

<template>
<transition
    name="fade"
    appear
    appear-active-class="fade-in"
    leave-active-class="fade-out"
>
    <div v-if="show" :class="['rounded-sm p-2 shadow-lg relative', `tw-notif--${kind}`]">
        <div class="flex">
            <div class="flex justify-center items-center py-2 pl-2 pr-4">
                <i :class="['tw-notif__icon text-2xl', setIconClass()]"></i>
            </div>
            <div class="flex justify-center items-center">
                <div v-if="message">{{ message }}</div>
                <template v-else>
                    <slot></slot>
                </template>
            </div>
            <div class="flex justify-center items-center py-2 pl-2 pr-1">
                <i
                    class="fas fa-times text-danger cursor-pointer"
                    @click="close"
                ></i>
            </div>
        </div>
    </div>
</transition>
</template>

<style lang="scss">
$notifColors: (
    success: #b1eeb1,
    error: #eeb1be,
    warning: #eee5b1,
    info: #b1cdee,
    primary: #cbb1ee,
    secondary: #edeeb1,
    light: #f3f3e7,
    dark: #010811,
);

@mixin notif-style($kind, $backgroundColor) {
    .tw-notif--#{$kind} {
        background-color: $backgroundColor;
        @if $kind == dark {
        color: white !important;
        }
    }
    .tw-notif__icon {
        color: $backgroundColor
    }
}

@each $kind, $color in $notifColors {
    @include notif-style($kind, $color);
}
</style>