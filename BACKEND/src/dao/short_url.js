import urlSchema from "../models/short_url.model.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errorHandler.js";

export const saveShortUrl = async (shortUrl, longUrl, userId) => {
    try{
        const newUrl = new urlSchema({
            full_url:longUrl,
            short_url:shortUrl
        })
        if(userId){
            newUrl.user = userId
        }
        await newUrl.save()
    }catch(err){
        if(err.code == 11000){
            throw new ConflictError("Short URL already exists")
        }
        throw new Error(err)
    }
};

export const getShortUrl = async (shortUrl) => {
    return await urlSchema.findOneAndUpdate({short_url:shortUrl},{$inc:{clicks:1}});
}

export const getCustomShortUrl = async (slug) => {
    return await urlSchema.findOne({short_url:slug});
}

export const deleteUrlById = async (id, userId) => {
    const url = await urlSchema.findById(id)
    if (!url) throw new NotFoundError("URL not found")
    if (url.user?.toString() !== userId.toString()) throw new UnauthorizedError("Not authorized to delete this URL")
    return await urlSchema.findByIdAndDelete(id)
}