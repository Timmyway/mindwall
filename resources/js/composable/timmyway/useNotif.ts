import { Notification } from "@/types/notification";
import { computed, ref } from "vue";

export function useNotif() {
    const notifs = ref<Notification[]>([]);

    const DEFAULT_TIMEOUT = 3000;
    const DEFAULT_KIND = 'success';

    const notifUser = (newNotifs: Notification[], applyTimeout = true) => {
        // Map through the incoming notifications and set defaults
        notifs.value = newNotifs.map(notif => ({
            message: notif.message,
            timeout: notif.timeout ?? DEFAULT_TIMEOUT, // Default to 3000 if not provided
            kind: notif.kind ?? DEFAULT_KIND,         // Default to 'success' if not provided
            show: notif.show ?? true                    // Default to true if not provided
        }));

        // Apply timeouts if specified
        if (applyTimeout) {
            notifs.value.forEach((notif, index) => {
                setTimeout(() => {
                    dismissNotif(index);
                }, notif.timeout);
            });
        }
    };

    function dismissNotif(index: number | null = null) {
        if (index === null) return; // Check for null instead of falsy value

        if (Array.isArray(notifs.value)) {
            // Remove the notification at the specified index
            notifs.value.splice(index, 1);
        }
    }

    const hasNotif = computed(() => {
        return notifs.value.length > 0;
    })

    return { notifs, hasNotif, notifUser, dismissNotif }
}
