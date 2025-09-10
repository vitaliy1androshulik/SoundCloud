import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { APP_ENV } from "../env";

export const baseQuery = fetchBaseQuery({
    baseUrl: APP_ENV.REMOTE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).user.token;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});