import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "../api/user.api";
import { login } from "../store/slice/authSlice";

export const checkAuth = async ({ context, location }) => {
    try {
        const { queryClient, store } = context;
        const user = await queryClient.ensureQueryData({
            queryKey: ["currentUser"],
            queryFn: getCurrentUser,
        });
        if (!user || !user.user) {
            // Not logged in — redirect to auth, but don't replace browser history
            // so the back button still works as expected
            throw redirect({ to: "/auth", search: { from: location?.pathname || "/" }, replace: false });
        }
        store.dispatch(login(user.user));
        const { isAuthenticated } = store.getState().auth;
        if (!isAuthenticated) {
            throw redirect({ to: "/auth", search: { from: location?.pathname || "/" }, replace: false });
        }
        return true;
    } catch (error) {
        // Re-throw router redirects, only catch actual errors
        if (error?.isRedirect) throw error;
        console.log(error);
        throw redirect({ to: "/auth", replace: false });
    }
};

