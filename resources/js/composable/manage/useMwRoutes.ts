import { usePage } from "@inertiajs/vue3";
import { computed, ref } from "vue";

export interface MwRoute {
    label: string;
    icon: string;
    urls: string[];
    private: boolean;
}

export default function useMwRoutes() {
    const items = ref<MwRoute[]>([
        {
            label: 'Home',
            icon: 'fa fa-home',
            urls: [route('home')],
            private: false
        },
        {
            label: 'Walls',
            icon: 'fa fa-bolt',
            urls: [route('thematic.list')],
            private: true
        },
        {
            label: 'Dashboard',
            icon: 'fa fa-user',
            urls: [route('dashboard'), route('prompt.list')],
            private: true
        },
        {
            label: 'Help',
            icon: 'fa fa-question-circle',
            urls: [route('help.prompts')],
            private: true
        },
    ]);

    const page = usePage();

    const currentUrl = computed(() => {
        return page.url;
    })

    const getPath = (url: string) => new URL(url, window.location.origin).pathname;

    const isActive = (urls: string[]): boolean => {
        const currentPath = getPath(currentUrl.value);
        return urls.some(url => getPath(url) === currentPath);
    };

    return { items, isActive }
}
