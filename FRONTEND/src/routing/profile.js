import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./routeTree"
import ProfilePage from "../pages/ProfilePage"
import { checkAuth } from "../utils/helper"

export const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfilePage,
    beforeLoad: checkAuth
})
