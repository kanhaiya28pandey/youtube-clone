import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
// @ts-ignore: Side-effect import for global CSS without type declarations
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { UserProvider } from "../lib/AuthContext";
export default function App({ Component, pageProps }: AppProps) {

  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);


  useEffect(() => {

    const checkTheme = async () => {

      try {

        navigator.geolocation.getCurrentPosition(
          async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // const lat = 13.0827;
            // const lon = 80.2707;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );

            const data = await response.json();

            const state =
              data?.address?.state || "";

            console.log("State:", state);

            const southStates = [
              "Tamil Nadu",
              "Kerala",
              "Karnataka",
              "Andhra Pradesh",
              "Telangana",
            ];

            const indiaTime =
              new Date().toLocaleString(
                "en-US",
                {
                  timeZone: "Asia/Kolkata",
                }
              );

            const hour =
              new Date(indiaTime).getHours();

            console.log("Hour:", hour);

            if (
              southStates.includes(state) &&
              hour >= 10 &&
              hour < 12
            ) {
              setTheme("light");
              localStorage.setItem("theme", "light");
            } else {
              setTheme("dark");
              localStorage.setItem("theme", "dark");
            }
          },
          () => {
            setTheme("dark");
            localStorage.setItem("theme", "dark");
          }
        );

      } catch (error) {
        console.log(error);
        setTheme("dark");
        localStorage.setItem("theme", "dark");
      }
    };

    checkTheme();

  }, []);
  useEffect(() => {
    document.documentElement.classList.remove("dark");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);
  if (!mounted) {
    return null;
  }
  return (
    <UserProvider>
      <div
        className={`
    min-h-screen
    ${theme === "dark" ? "dark" : ""}
  `}
      >
        <title>Your-Tube Clone</title>
        <Header />
        <Toaster />
        <div className="flex w-full">
          <Sidebar />
          <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}
