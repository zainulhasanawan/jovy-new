import { logout } from "@/services/apiAuth";

interface AuthContextValue {
  signOut: () => Promise<void>;
}

export function useAuth(): AuthContextValue {
  return {
    signOut: logout,
  };
}
