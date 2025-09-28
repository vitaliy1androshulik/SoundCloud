import {IGenre} from "../types/genre.ts";
import api from "../utilities/axiosInstance.ts";

export const genreService = {
    getGenres: async (): Promise<IGenre[]> => {
        const res = await api.get("/Genre");
        return res.data;
    },
};