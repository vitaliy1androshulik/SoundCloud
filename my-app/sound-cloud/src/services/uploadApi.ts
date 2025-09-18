// services/uploadApi.ts
import api from "../utilities/axiosInstance.ts";

export const uploadService = {
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/uploads", formData);
        return data;
    }
};