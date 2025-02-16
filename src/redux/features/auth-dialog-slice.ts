import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FormType = "login" | "register" | "forgot-password" | "new-verification" | "error" | "new-password";

type DialogState = {
  isOpen: boolean;
  formType: FormType;
};

const initialState: DialogState = {
  isOpen: false,
  formType: "login",
};

const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (state, formType: PayloadAction<FormType>) => {
      state.isOpen = true;
      state.formType = formType.payload;
    },
    closeDialog: (state) => {
      state.formType = "login";
      state.isOpen = false;
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;
export default dialogSlice.reducer;
