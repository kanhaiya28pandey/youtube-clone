import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, useRef } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [remainingWatchSeconds, setRemainingWatchSeconds] = useState(null);

  const watchIntervalRef = useRef(null);
  const pendingSecondsRef = useRef(0);
  const getWatchLimit = (plan) => {
    switch (plan) {
      case "bronze":
        return 7;
      case "silver":
        return 10;
      case "gold":
        return null;
      default:
        return 5;
    }
  };
  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));

    const limit = getWatchLimit(userdata.plan);

    if (limit === null) {
      setRemainingWatchSeconds(null);
    } else {
      const used = userdata.watchTimeUsed || 0;
      setRemainingWatchSeconds(Math.max(0, (limit - used) * 60));
    }
  };
  const syncWatchTime = async () => {
    if (!user || pendingSecondsRef.current <= 0) {
      return;
    }

    const seconds = pendingSecondsRef.current;
    pendingSecondsRef.current = 0;

    try {
      const response = await axiosInstance.post("/watchtime/update", {
        userId: user._id,
        seconds,
      });

      if (typeof response.data.remaining === "number") {
        setRemainingWatchSeconds(Math.max(0, response.data.remaining * 60));
      }

      if (typeof response.data.used === "number") {
        setUser((prev) => {
          if (!prev) return prev;

          const updatedUser = {
            ...prev,
            watchTimeUsed: response.data.used,
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));

          return updatedUser;
        });
      }
    } catch (error) {
      console.log("Watch time update error:", error);

      // Don't lose the seconds if backend request fails
      pendingSecondsRef.current += seconds;
    }
  };
  const stopWatching = async () => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }

    await syncWatchTime();
  };
  const startWatching = () => {
    if (!user || user.plan === "gold") {
      return;
    }

    if (remainingWatchSeconds !== null && remainingWatchSeconds <= 0) {
      return;
    }

    // Already watching
    if (watchIntervalRef.current) {
      return;
    }

    watchIntervalRef.current = setInterval(() => {
      setRemainingWatchSeconds((prev) => {
        if (prev === null) {
          return null;
        }

        const next = Math.max(0, prev - 1);

        pendingSecondsRef.current += 1;

        if (next <= 0) {
          setTimeout(() => {
            stopWatching();
          }, 0);
        }

        return next;
      });

      // Sync with backend every 5 seconds
      if (pendingSecondsRef.current >= 5) {
        syncWatchTime();
      }
    }, 1000);
  };
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosInstance.post("/user/login", payload);
          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unsubcribe();
  }, []);
  useEffect(() => {
    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
      }
    };
  }, []);
  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        remainingWatchSeconds,
        startWatching,
        stopWatching,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
