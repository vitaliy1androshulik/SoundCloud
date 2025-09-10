let accessToken: string | null = null;
let refreshToken: string | null = null;

export const TokenService = {
    getAccessToken: () => accessToken,
    setAccessToken: (token: string) => { accessToken = token },

    getRefreshToken: () => refreshToken,
    setRefreshToken: (token: string) => { refreshToken = token },

    clearTokens: () => {
        accessToken = null;
        refreshToken = null;
    }
};