let accessToken: string | null = null;

export const TokenService = {
    getAccessToken: (): string | null => {
        if (!accessToken) {
            accessToken = localStorage.getItem("token");
        }
        return accessToken;
    },

    setAccessToken: (token: string) => {
        accessToken = token;
        localStorage.setItem("accessToken", token);
    },

    clearTokens: () => {
        accessToken = null;
        localStorage.removeItem("token");
    },
};