import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, useRef, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

const SOUTH_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [remainingWatchSeconds, setRemainingWatchSeconds] = useState(null);

  // NEW: pending Google login data
  const [pendingLogin, setPendingLogin] = useState(null);

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

      if (pendingSecondsRef.current >= 5) {
        syncWatchTime();
      }
    }, 1000);
  };

  const logout = async () => {
    setUser(null);
    setPendingLogin(null);
    localStorage.removeItem("user");

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  /*
   * Get user's state from browser location
   */
  const getUserState = async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );

            const data = await response.json();

            resolve(data?.address?.state || "");
          } catch (error) {
            console.log("Location error:", error);
            resolve("");
          }
        },
        () => {
          console.log("Location permission denied");
          resolve("");
        },
      );
    });
  };

  /*
   * Google login
   *
   * IMPORTANT:
   * Don't actually log the user into our application yet.
   * First open OTP verification.
   */
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      const state = await getUserState();

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image:
          firebaseuser.photoURL || "https://github.com/shadcn.png",
        state,
      };

      console.log("Login location state:", state);

      // Store pending login until OTP is verified
      setPendingLogin(payload);
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  /*
   * Called after OTP is successfully verified
   */
  const completeLogin = async () => {
    if (!pendingLogin) {
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/user/login",
        pendingLogin,
      );

      login(response.data.result);

      /*
       * Apply theme based on login state + IST time
       */
      const south = SOUTH_STATES.includes(pendingLogin.state);

      const indiaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      const hour = new Date(indiaTime).getHours();

      const shouldUseLightTheme =
        south && hour >= 10 && hour < 12;

      localStorage.setItem(
        "theme",
        shouldUseLightTheme ? "light" : "dark",
      );

      setPendingLogin(null);
    } catch (error) {
      console.error("Complete login error:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    /*
     * Firebase authentication state is intentionally NOT
     * used to directly log into the application.
     *
     * OTP must be completed first.
     */
    const unsubscribe = onAuthStateChanged(auth, (firebaseuser) => {
      console.log("Firebase user:", firebaseuser?.email);
    });

    return () => unsubscribe();
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
        completeLogin,
        pendingLogin,
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