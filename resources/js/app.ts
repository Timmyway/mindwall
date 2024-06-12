import './bootstrap';
import '../sass/app.scss';

import { createApp, h, DefineComponent } from 'vue';
import { createInertiaApp, Link } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import PrimeVue from 'primevue/config';
import VueKonva from 'vue-konva';
import 'primevue/resources/themes/aura-light-green/theme.css'
import { createPinia } from 'pinia';

const appName = import.meta.env.VITE_APP_NAME || 'Mindwall';

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

        app.config.globalProperties.$route = route;

        app.use(pinia);
        app.use(plugin);
        app.use(ZiggyVue);
        app.use(VueKonva);
        app.use(PrimeVue);

        app.component('Link', Link);

        app.mount(el);
    },
    progress: {
        color: '#29178A',
    },
});
