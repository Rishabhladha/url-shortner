import wrapAsync from "../utils/tryCatchWrapper.js"
import { deleteUrlById } from "../dao/short_url.js"

export const deleteUrl = wrapAsync(async (req, res) => {
    const { id } = req.params
    const { _id } = req.user
    await deleteUrlById(id, _id)
    res.status(200).json({message: "URL deleted successfully"})
})
