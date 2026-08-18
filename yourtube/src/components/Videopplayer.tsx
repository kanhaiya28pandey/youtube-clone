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
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const {
    user,
    remainingWatchSeconds,
    startWatching,
    stopWatching,
  } = useUser();

  const [showLimitPopup, setShowLimitPopup] =
    useState(false);

  /*
   * Start global watch timer when video starts.
   */

  const handlePlay = () => {
    if (!user) {
      return;
    }

    /*
     * Gold has unlimited watch time.
     */

    if (user.plan === "gold") {
      return;
    }

    /*
     * Don't allow playback when time is over.
     */

    if (
      remainingWatchSeconds !== null &&
      remainingWatchSeconds <= 0
    ) {
      videoRef.current?.pause();

      setShowLimitPopup(true);

      return;
    }

    startWatching();
  };

  /*
   * Stop global watch timer when video pauses.
   */

  const handlePause = () => {
    stopWatching();
  };

  /*
   * Video ended.
   */

  const handleEnded = () => {
    stopWatching();
  };

  /*
   * If the global watch timer reaches zero,
   * pause the current video.
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.plan === "gold") {
      return;
    }

    if (
      remainingWatchSeconds !== null &&
      remainingWatchSeconds <= 0
    ) {
      if (videoRef.current) {
        videoRef.current.pause();
      }

      setShowLimitPopup(true);
    }
  }, [
    remainingWatchSeconds,
    user,
  ]);

  /*
   * Important:
   *
   * When this video component disappears because
   * the user opened another video/page, stop the
   * global timer.
   */

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return (
    <>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {video?.filepath ? (
          <video
            ref={videoRef}
            controls
            className="w-full h-full"
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/download/watch/${video._id}`}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
          />
        ) : (
          <div>No video available</div>
        )}
      </div>

      {showLimitPopup && (
        <div
          className="
            fixed
            inset-0
            bg-black/60
            flex
            items-center
            justify-center
            z-50
          "
        >
          <div
            className="
              bg-card
              text-foreground
              p-6
              rounded-2xl
              border
              border-border
              max-w-md
              w-full
              mx-4
            "
          >
            <h2 className="text-2xl font-bold mb-2">
              Watch Limit Reached
            </h2>

            <p className="text-muted-foreground mb-5">
              Your {user?.plan || "free"} plan
              watch time has been reached.
              Upgrade your plan to watch more
              videos.
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