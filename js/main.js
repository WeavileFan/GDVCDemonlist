import routes from './routes.js';

const safeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Ignore storage errors (e.g. Safari private mode, blocked storage).
        }
    },
};

const getStoredDarkMode = () => {
    const raw = safeStorage.getItem('dark');

    if (raw === null || raw === 'undefined') {
        return false;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return false;
    }
};

export const store = Vue.reactive({
    dark: getStoredDarkMode(),

    timeMachineVersion: null,
    toggleDark() {
        this.dark = !this.dark;
        safeStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');
