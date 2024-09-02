import { useNotif } from "@/composable/timmyway/useNotif";
import { defineStore } from "pinia";

export const useNotifStore = defineStore('notification', () => {
    const { notifs, hasNotif, notifUser, dismissNotif } = useNotif();    

    return { notifs, hasNotif, notifUser, dismissNotif }
});
