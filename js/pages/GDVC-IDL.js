import List from './List-IDL.js';

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
