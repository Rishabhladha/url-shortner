import "dotenv/config";

import express from "express";
import {nanoid} from "nanoid";
import connectDB from "./src/config/monogo.config.js";
import short_url from "./src/routes/short_url.route.js";
import url_routes from "./src/routes/url.routes.js";
import user_routes from "./src/routes/user.routes.js";
import auth_routes from "./src/routes/auth.routes.js";
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import cors from "cors";
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser";

import analytics_routes from "./src/routes/analytics.routes.js";

const app = express();
app.set('trust proxy', true); // Trust the proxy for IP resolution

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(attachUser)

app.use("/api/user",user_routes)
app.use("/api/auth",auth_routes)
app.use("/api/create",short_url)
app.use("/api/url",url_routes)
app.use("/api/analytics", analytics_routes)
app.get("/:id",redirectFromShortUrl)

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    connectDB()
    console.log(`Server is running on port ${PORT}`);
})

// GET - Redirection 
