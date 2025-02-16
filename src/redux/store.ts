import { configureStore } from "@reduxjs/toolkit";
import authDialogReducer from "./features/auth-dialog-slice";

export const store = configureStore({
    reducer: {
        dialog: authDialogReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;