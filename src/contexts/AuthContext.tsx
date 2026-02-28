import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/api/client";
import { useAuthStore } from "@/store/authStore";

interface AuthContextType {
    user: User | any | null;
    loading: boolean;
    manualLogin: (user: any, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    manualLogin: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | any | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to handle manual (email/password) login state
    const manualLogin = (userData: any, token: string) => {
        localStorage.setItem('token', token);
        // Also save user to localStorage for persistence across reloads (simple version)
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        setUser(null);
    };

    useEffect(() => {
        let mounted = true;

        // CATCH-ALL TIMEOUT to prevent infinite buffering
        // If auth state doesn't resolve in 8 seconds, we must show the app anyway
        const authTimeout = setTimeout(() => {
            if (mounted) {
                console.warn("Auth check timed out. Forcing loading to false.");
                setLoading(false);
            }
        }, 8000);

        // Check for legacy/manual user persistence first
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user_data');
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (mounted) {
                    setUser(parsedUser);
                    // Optimization: If we have a cached user, we can stop loading early 
                    // while Firebase synchronizes in the background.
                    setLoading(false);
                    clearTimeout(authTimeout);
                }
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }

        const { setAuth, logout: storeLogout } = useAuthStore.getState();

        // PART 1: Listener must exist ONLY ONCE
        let unsubscribe: () => void;

        if (!auth) {
            console.warn("Firebase Auth not initialized. Unblocking UI.");
            if (mounted) setLoading(false);
            clearTimeout(authTimeout);
        } else {
            unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!firebaseUser) {
                    clearTimeout(authTimeout);
                    if (!localStorage.getItem('token')) {
                        if (mounted) {
                            setUser(null);
                            setLoading(false);
                        }
                        storeLogout();
                    } else {
                        // We have a manual token but no firebase context
                        if (mounted) setLoading(false);
                    }
                    return;
                }

                try {
                    // Sync with backend
                    const idToken = await firebaseUser.getIdToken();
                    const res = await api.post("/auth/google", { idToken }, { timeout: 8000 });
                    
                    if (res.data?.token) {
                        localStorage.setItem('token', res.data.token);
                        localStorage.setItem('user_data', JSON.stringify(res.data.user || firebaseUser));
                        setAuth(res.data.user || firebaseUser, res.data.token);
                        if (mounted) setUser(res.data.user || firebaseUser);
                    } else {
                        if (mounted) setUser(firebaseUser);
                    }
                } catch (error: any) {
                    console.error("Backend sync failed:", error.message);
                    // Fallback to firebase user so dashboard at least tries to load
                    if (mounted) setUser(firebaseUser);
                } finally {
                    clearTimeout(authTimeout);
                    if (mounted) setLoading(false);
                }
            });
        }

        return () => {
            mounted = false;
            clearTimeout(authTimeout);
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, manualLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
