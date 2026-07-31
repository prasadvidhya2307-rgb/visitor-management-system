import multer from "multer";
import { AppError } from "../utils/app-error.js";

export const uplaod = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024 //5mb
    },

    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png"
        ]

        console.log(file)

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new AppError(
                    "only jpg and png are alowed",
                    400
                )
            )
        }

        cb(null, true)
    }
})