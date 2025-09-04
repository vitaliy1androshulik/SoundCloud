import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser,initialState } from "../../types/user";


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;

            localStorage.setItem("token", action.payload.token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;