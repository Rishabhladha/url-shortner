import User from "../models/user.model.js"
import UrlModel from "../models/short_url.model.js"
import bcrypt from "bcryptjs"

export const findUserByEmail = async (email) => {
    return await User.findOne({email})
}

export const findUserByEmailByPassword = async (email) => {
    return await User.findOne({email}).select('+password')
}

export const findUserByEmailWithOtp = async (email) => {
    return await User.findOne({email}).select('+password +otp +otpExpiry')
}

export const findUserById = async (id) => {
    return await User.findById(id)
}

export const findUserByIdWithPassword = async (id) => {
    return await User.findById(id).select('+password')
}

export const createUser = async (name, email, password) => {
    const newUser = new User({name, email, password})
    await newUser.save()
    return newUser
}

export const getUserUrlsPaginated = async (id, page = 1, limit = 10) => {
    const skip = (page - 1) * limit
    const [urls, total] = await Promise.all([
        UrlModel.find({user: id}).sort({createdAt: -1}).skip(skip).limit(limit),
        UrlModel.countDocuments({user: id})
    ])
    return { urls, total, page, limit, hasMore: skip + urls.length < total }
}

export const updateUserName = async (id, name) => {
    return await User.findByIdAndUpdate(id, { name }, { new: true })
}

export const changeUserPassword = async (id, newPassword) => {
    const hashed = await bcrypt.hash(newPassword, 10)
    return await User.findByIdAndUpdate(id, { password: hashed }, { new: true })
}

export const deleteUserById = async (id) => {
    return await User.findByIdAndDelete(id)
}

export const deleteAllUserUrls = async (userId) => {
    return await UrlModel.deleteMany({user: userId})
}

export const saveOtp = async (email, otp, expiry) => {
    return await User.findOneAndUpdate(
        { email },
        { otp, otpExpiry: expiry },
        { new: true }
    )
}

export const clearOtp = async (email) => {
    return await User.findOneAndUpdate(
        { email },
        { $unset: { otp: 1, otpExpiry: 1 } },
        { new: true }
    )
}