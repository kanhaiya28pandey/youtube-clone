"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/AuthContext";

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

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleTimeUpdate = () => {
      let limit = Infinity;

      switch (user?.plan) {
        case "bronze":
          limit = 7 * 60;
          break;

        case "silver":
          limit = 10 * 60;
          break;

        case "gold":
          limit = Infinity;
          break;

        default:
          limit = 5 * 60;
      }

      if (videoElement.currentTime >= limit) {
        videoElement.pause();

        setShowLimitPopup(true);
      }
    };

    videoElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    return () => {
      videoElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
    };
  }, [user]);

  return (
    <>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {video?.filepath ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-full"
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
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
              Upgrade your plan to continue
              watching this video.
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