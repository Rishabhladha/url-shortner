import wrapAsync from "../utils/tryCatchWrapper.js"
import {
    getUserUrlsPaginated,
    updateUserName,
    findUserByIdWithPassword,
    changeUserPassword,
    deleteUserById,
    deleteAllUserUrls
} from "../dao/user.dao.js"
import { cookieOptions } from "../config/config.js"
import { BadRequestError, UnauthorizedError } from "../utils/errorHandler.js"



export const getUserUrlsPaginatedController = wrapAsync(async (req, res) => {
    const {_id} = req.user
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const result = await getUserUrlsPaginated(_id, page, limit)
    res.status(200).json({message:"success", ...result})
})

export const updateProfile = wrapAsync(async (req, res) => {
    const {_id} = req.user
    const {name} = req.body
    if (!name || name.trim().length < 2) throw new BadRequestError("Name must be at least 2 characters")
    const updatedUser = await updateUserName(_id, name.trim())
    res.status(200).json({message:"Profile updated", user: updatedUser})
})

export const changePassword = wrapAsync(async (req, res) => {
    const {_id} = req.user
    const {currentPassword, newPassword} = req.body
    if (!currentPassword || !newPassword) throw new BadRequestError("All fields required")
    if (newPassword.length < 6) throw new BadRequestError("New password must be at least 6 characters")

    const user = await findUserByIdWithPassword(_id)
    const isValid = await user.comparePassword(currentPassword)
    if (!isValid) throw new UnauthorizedError("Current password is incorrect")

    await changeUserPassword(_id, newPassword)
    res.status(200).json({message:"Password changed successfully"})
})

export const deleteAccount = wrapAsync(async (req, res) => {
    const {_id} = req.user
    await deleteAllUserUrls(_id)
    await deleteUserById(_id)
    res.clearCookie("accessToken", cookieOptions)
    res.status(200).json({message:"Account deleted successfully"})
})