import './bootstrap';
import '../sass/app.scss';

import { createApp, h, DefineComponent } from 'vue';
import { createInertiaApp, Link } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import PrimeVue from 'primevue/config';
import VueKonva from 'vue-konva';
import 'primevue/resources/themes/aura-light-green/theme.css'
import Paginator from 'primevue/paginator';
import { createPinia } from 'pinia';
import Tooltip from 'primevue/tooltip';
import Ripple from 'primevue/ripple';

const appName = import.meta.env.VITE_APP_NAME || 'Mindwall';
const apiUrl = import.meta.env.VITE_APP_ENV === 'prod'
    ? import.meta.env.VITE_API_BASE_URI_PROD
    : import.meta.env.VITE_API_BASE_URI_DEV;

// Define the global Vue instance with $route property
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $route: typeof route;
    }
}

const pinia = createPinia();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob<DefineComponent>('./Pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) });

        app.directive('tooltip', Tooltip);
        app.directive('ripple', Ripple);

        app.config.globalProperties.$route = route;

        app.provide('$apiUrl', apiUrl);

        app.use(pinia);
        app.use(plugin);
        app.use(ZiggyVue);
        app.use(VueKonva);
        app.use(PrimeVue);

        app.component('Link', Link);
        app.component('Paginator', Paginator);

        app.mount(el);
    },
    progress: {
        color: '#29178A',
    },
});
