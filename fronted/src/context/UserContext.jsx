import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Fetch session user on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {

        const url = `${import.meta.env.VITE_API_BASE_URL}/api/cart/remove/${productId}?userId=${userId}`;
        
        const res = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include"
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
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
