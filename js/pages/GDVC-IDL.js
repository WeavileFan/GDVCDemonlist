import List from './List.js';

export default {
    ...List,

    data() {
        return {
            ...List.data(),
            dataDir: './gdvc-idl',
        };
    },

    methods: {
        ...List.methods,
        score() {
            return 0;
        },
    },
};
