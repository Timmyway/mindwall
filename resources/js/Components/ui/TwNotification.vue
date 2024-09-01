<script setup lang="ts">
import { useNotifStore } from '@/store/notificationStore';
import { NotifPosition } from '@/types/notification';

interface Props {
    pos?: NotifPosition;
}

const props = withDefaults(defineProps<Props>(), {
    pos: 'br'
});
const notifStore = useNotifStore();

</script>

<template>
<transition
    name="fade"
    appear
    appear-active-class="fade-in"
    leave-active-class="fade-out"
>
    <div v-if="notifStore.hasNotif" :class="['notification-stack', `notification--${pos}`]">
        <template v-for="notif, index in notifStore.notifs">
            <div
                :class="['notification', 'notif-' + notif.kind]"
                v-show="notif.show"
            >
                <div class="notification__decoration">&nbsp;</div>
                <div class="notification__message">{{ notif.message }}</div>
                <div class="notification__btn-close">
                    <button @click.prevent="notifStore.dismissNotif(index)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </template>
    </div>
</transition>
</template>

<style lang="scss">
.notification-stack {
    position: fixed;
    padding: 1rem;
    border-radius: 4px;
    width: fit-content;
    max-width: 640px;
    color: white;
    z-index: 91;
    display: flex; flex-direction: column; gap: 5px;
    height: auto;
    max-height: 95vh;
    overflow-y: auto;
}
.notification {
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px;
    border-radius: 4px;
    max-height: 240px;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: #aaa #fefefe;
    display: flex;
    position: relative;
    &__decoration {
        width: 10px;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    }
    &__message {
        padding: 5px 10px;
    }
    &__btn-close {
        width: 16px; height: 16px;
        font-size: .6rem;
        background-color: #aaaaaa;
        position: absolute;
        top: 2px; right: 2px;
        display: flex; justify-content: center; align-items: center;
        border-radius: 100%;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
        transition: all .2s;
        cursor: pointer;
        &:hover {
            background-color: #d10ab0;
        }

    }
}
.notification--tl {top: 0; left: 0}
.notification--tr {top: 0; right: 0}
.notification--br {bottom: 0; right: 5px}
.notification--bl {bottom: 0; left: 0}

.notif-success {
    background: #2FBF71;
    .notification__decoration {
        background-color: hsl(147, 61%, 37%);
    }
}
.notif-warning {
    background: #ffab3cea;
    .notification__decoration {
        background-color: hsla(34, 100%, 42%, 0.918);
    }
}
.notif-error {
    background: #EF2D56;
    .notification__decoration {
        background-color: hsl(347, 86%, 46%);
    }
}
.notif-info {
    background: #712def;
    .notification__decoration {
        background-color: hsl(261, 86%, 26%);
    }
}

.fade-in {
  animation: fade-in 0.5s ease-in-out;
}

.fade-out {
  animation: fade-out 0.5s ease-in-out;
}

@keyframes fade-in {
    0% {
        opacity: 0;
        transform: translateX(-15px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fade-out {
    0% {
        opacity: 1;
        transform: translateX(0);
    }
    100% {
        opacity: 0;
        transform: translateX(-15px);
    }
}
</style>
