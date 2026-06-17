"use client";


import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({
  video,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { user } = useUser();

  const [showLimitPopup, setShowLimitPopup] =
    useState(false);
  const [remainingTime, setRemainingTime] =
    useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    if (user.plan === "gold") {
      setRemainingTime(null);
      return;
    }

    const remaining =
      (user.watchTimeLimit -
        (user.watchTimeUsed || 0)) * 60;

    setRemainingTime(remaining);

    const interval = setInterval(async () => {
      const video = videoRef.current;

      // Don't count if video isn't actively playing
      if (!video || video.paused || video.ended) {
        return;
      }

      try {
        console.log("Sending watchtime update");

        const res = await axiosInstance.post(
          "/watchtime/update",
          {
            userId: user._id,
            seconds: 30,
          }
        );

        console.log(
          "Dispatching event:",
          res.data.remaining
        );

        window.dispatchEvent(
          new CustomEvent("watchtimeUpdated", {
            detail: {
              remaining: res.data.remaining,
              used: res.data.used,
            },
          })
        );

        console.log("Response:", res.data);

        if (res.data.limitReached) {
          video.pause();

          setRemainingTime(0);

          setShowLimitPopup(true);

          clearInterval(interval);

          return;
        }

        setRemainingTime(
          Math.max(0, res.data.remaining * 60)
        );
      } catch (error) {
        console.log(error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  return (
    <>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {video?.filepath ? (
          <video
            ref={videoRef}
            controls
            autoPlay={remainingTime !== 0}
            className="w-full h-full"
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
            onPlay={(e) => {
              if (
                user &&
                user.plan !== "gold" &&
                user.watchTimeUsed >= user.watchTimeLimit
              ) {
                e.currentTarget.pause();

                setShowLimitPopup(true);
              }
            }}
          />
        ) : (
          <div>No video available</div>
        )}
      </div>

      {showLimitPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full text-center">

            <h2 className="text-2xl font-bold mb-2">
              Watch Limit Reached
            </h2>

            <p className="text-gray-600 mb-5">
              Your watch limit for the
              ${user?.plan || "free"} plan has been reached.

              Upgrade now for more watch time.
            </p>

            <a href="/premium">
              <button
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                "
              >
                Upgrade Plan
              </button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}