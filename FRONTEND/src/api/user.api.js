import axiosInstance from "../utils/axiosInstance"

export const loginUser = async (password,email) =>{
    const {data} = await axiosInstance.post("/api/auth/login",{email,password})
    return data
}

export const registerUser = async (name,password,email) =>{
    const {data} = await axiosInstance.post("/api/auth/register",{name,email,password})
    return data
}

export const logoutUser = async () =>{
    const {data} = await axiosInstance.get("/api/auth/logout")
    return data
}

export const getCurrentUser = async () =>{
    const {data} = await axiosInstance.get("/api/auth/me")
    return data
}

export const getUserUrlsPaginated = async (page = 1, limit = 10) =>{
    const {data} = await axiosInstance.get(`/api/user/urls/paginated?page=${page}&limit=${limit}`)
    return data
}

export const deleteUrl = async (id) =>{
    const {data} = await axiosInstance.delete(`/api/url/${id}`)
    return data
}

export const updateProfile = async (name) =>{
    const {data} = await axiosInstance.put("/api/user/profile", {name})
    return data
}

export const changePassword = async (currentPassword, newPassword) =>{
    const {data} = await axiosInstance.put("/api/user/change-password", {currentPassword, newPassword})
    return data
}

export const deleteAccount = async () =>{
    const {data} = await axiosInstance.delete("/api/user/account")
    return data
}

export const sendForgotPasswordOtp = async (email) =>{
    const {data} = await axiosInstance.post("/api/auth/forgot-password", {email})
    return data
}

export const resetPassword = async (email, otp, newPassword) =>{
    const {data} = await axiosInstance.post("/api/auth/reset-password", {email, otp, newPassword})
    return data
}