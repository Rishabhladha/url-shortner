import { getShortUrl } from "../dao/short_url.js"
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.js"
import wrapAsync from "../utils/tryCatchWrapper.js"
import geoip from 'geoip-lite';
import useragent from 'useragent';
import Click from '../models/click.model.js';

export const createShortUrl = wrapAsync(async (req,res)=>{
    const data = req.body
    let shortUrl
    if(req.user){
        shortUrl = await createShortUrlWithUser(data.url,req.user._id,data.slug)
    }else{  
        shortUrl = await createShortUrlWithoutUser(data.url)
    }
    // Return the short code only — the frontend composes the full URL using VITE_BACKEND_URL
    // This avoids broken links when APP_URL env var is not set correctly on the hosting provider
    res.status(200).json({shortUrl : shortUrl})
})


export const redirectFromShortUrl = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const url = await getShortUrl(id)
    if(!url) throw new Error("Short URL not found")
    res.redirect(url.full_url)

    // Log analytics asynchronously (fire-and-forget)
    logClick(req, url._id).catch(err => console.error("Failed to log analytics", err));
})

// Helper: check if an IP is a localhost / private address
const isLocalIP = (ip) => {
    if (!ip) return true;
    const cleaned = ip.replace('::ffff:', '');
    return ['::1', '127.0.0.1', 'localhost', '0.0.0.0'].includes(cleaned) ||
           cleaned.startsWith('192.168.') ||
           cleaned.startsWith('10.') ||
           /^172\.(1[6-9]|2\d|3[01])\./.test(cleaned);
};

// Helper: log a click with geo data
const logClick = async (req, shortUrlId) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();

    const agent = useragent.parse(req.headers['user-agent']);
    let country = "Unknown";
    let city = "Unknown";

    // Try geoip-lite first (works for real public IPs)
    const geo = geoip.lookup(ip);
    if (geo) {
        country = geo.country || "Unknown";
        city = geo.city || "Unknown";
    } else if (isLocalIP(ip)) {
        // Localhost / private IP — fallback to free API to get the server's public IP location
        try {
            const resp = await fetch('http://ip-api.com/json/?fields=country,city,countryCode');
            if (resp.ok) {
                const apiData = await resp.json();
                country = apiData.countryCode || apiData.country || "Unknown";
                city = apiData.city || "Unknown";
            }
        } catch {
            // silently fail — we'll just log Unknown
        }
    }

    await Click.create({
        shortUrl: shortUrlId,
        ipAddress: ip,
        country,
        city,
        browser: agent.family || "Unknown",
        os: agent.os.family || "Unknown",
    });
};

export const createCustomShortUrl = wrapAsync(async (req,res)=>{
    const {url,slug} = req.body
    const shortUrl = await createShortUrlWithoutUser(url,customUrl)
    res.status(200).json({shortUrl : process.env.APP_URL + shortUrl})
})