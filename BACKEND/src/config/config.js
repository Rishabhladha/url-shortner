
export const cookieOptions = {
    httpOnly: true,
    secure: true, // Must be true for SameSite: None to work
    sameSite: "None", // Required for cross-site cookies (Vercel -> Render)
    maxAge: 1000 * 60 * 60, // 1 hour
}