import { createContext, useState, useEffect } from "react";
import { buildApiUrl } from "../config/api";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Fetch session user on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = buildApiUrl("/api/auth/me");

        const res = await fetch(url, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        showLoginPopup,
        openLoginPopup: () => setShowLoginPopup(true),
        closeLoginPopup: () => setShowLoginPopup(false)
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
