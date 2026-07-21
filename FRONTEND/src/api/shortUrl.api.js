import axiosInstance from "../utils/axiosInstance"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

export const createShortUrl = async (url,slug) =>{
    const {data} = await axiosInstance.post("/api/create",{url,slug})
    // data.shortUrl is just the short code (e.g. "abc1234")
    // Compose the full clickable URL using the correct backend domain
    return `${BACKEND_URL}/${data.shortUrl}`
}
