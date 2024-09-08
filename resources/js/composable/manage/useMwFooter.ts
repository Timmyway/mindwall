import { SocialMedia } from "@/types/website.types";
import { usePage } from "@inertiajs/vue3";
import { computed, ref } from "vue";

export default function useMwFooter() {
    const socialMedias = ref<SocialMedia[]>([
        {
            id: 1,
            name: 'linkedin',
            platform: 'linkedin',
            icon: 'fab fa-linkedin',
            url: 'https://www.linkedin.com/in/timmyway',
            newTab: true
        },
        {
            id: 2,
            name: 'gitgub',
            icon: 'fab fa-github',
            platform: 'gitgub',
            url: 'https://github.com/Timmyway',
            newTab: true
        },
        {
            id: 3,
            name: 'youtube',
            icon: 'fab fa-youtube',
            platform: 'youtube',
            url: '',
            newTab: true
        },
    ]);

    return { socialMedias }
}
