import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer/authReducer.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serialization checks
                ignoredActions: ['your/action/type'],
            },
        })
        // Uncomment below to add logger in development
        // .concat(logger)
});

export default store;