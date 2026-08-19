"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/AuthContext";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  onNextVideo: () => void;
  onOpenComments: () => void;
}

export default function VideoPlayer({
  video,
  onNextVideo,
  onOpenComments,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tapCountRef = useRef(0);
  const tapPositionRef = useRef<"left" | "center" | "right" | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWebsiteClosed, setIsWebsiteClosed] = useState(false);
  const toggleFullscreen = async () => {
    const container = playerContainerRef.current;

    if (!container) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const handleCloseWebsite = async () => {
  try {
    // If currently in fullscreen, exit fullscreen first
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    // Stop video
    videoRef.current?.pause();

    // Attempt to close the current browser window/tab
    window.open("", "_self");
    window.close();
  } catch (error) {
    console.log("Unable to close browser window:", error);
  }
};
  const handleGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    const player = videoRef.current;

    if (!player) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const width = rect.width;

    let position: "left" | "center" | "right";

    if (x < width / 3) {
      position = "left";
    } else if (x > (width * 2) / 3) {
      position = "right";
    } else {
      position = "center";
    }

    if (tapPositionRef.current && tapPositionRef.current !== position) {
      tapCountRef.current = 0;

      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
    }

    tapPositionRef.current = position;
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    tapTimerRef.current = setTimeout(() => {
      const taps = tapCountRef.current;
      const gesturePosition = tapPositionRef.current;

      tapCountRef.current = 0;
      tapPositionRef.current = null;
      tapTimerRef.current = null;

      if (!gesturePosition) {
        return;
      }

      /*
       * 1 TAP CENTER
       * Pause / Resume
       */
      if (taps === 1 && gesturePosition === "center") {
        if (player.paused) {
          player.play().catch(() => {});
        } else {
          player.pause();
        }

        return;
      }

      /*
       * 2 TAPS LEFT
       * Go backward 10 seconds
       */
      if (taps === 2 && gesturePosition === "left") {
        player.currentTime = Math.max(0, player.currentTime - 10);

        return;
      }

      /*
       * 2 TAPS RIGHT
       * Go forward 10 seconds
       */
      if (taps === 2 && gesturePosition === "right") {
        const newTime = Math.min(
          player.duration || player.currentTime + 10,
          player.currentTime + 10,
        );

        player.currentTime = newTime;

        return;
      }

      /*
       * 3 TAPS CENTER
       * Next video
       */
      if (taps === 3 && gesturePosition === "center") {
        onNextVideo();
        return;
      }

      /*
       * 3 TAPS LEFT
       * Open comments
       */
      if (taps === 3 && gesturePosition === "left") {
        onOpenComments();
        return;
      }

      /*
       * 3 TAPS RIGHT
       * Try to close browser tab
       */
      if (taps === 3 && gesturePosition === "right") {
        handleCloseWebsite();
        return;
      }
    }, 400);
  };
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const { user, remainingWatchSeconds, startWatching, stopWatching } =
    useUser();

  const [showLimitPopup, setShowLimitPopup] = useState(false);

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

    if (remainingWatchSeconds !== null && remainingWatchSeconds <= 0) {
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
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.plan === "gold") {
      return;
    }

    if (remainingWatchSeconds !== null && remainingWatchSeconds <= 0) {
      if (videoRef.current) {
        videoRef.current.pause();
      }

      setShowLimitPopup(true);
    }
  }, [remainingWatchSeconds, user]);

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
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === playerContainerRef.current,
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        ref={playerContainerRef}
        className={`relative bg-black overflow-hidden ${
          isFullscreen
            ? "w-screen h-screen rounded-none"
            : "aspect-video rounded-lg"
        }`}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {video?.filepath ? (
          <>
            <video
              ref={videoRef}
              controls
              className="w-full h-full"
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/download/watch/${video._id}`}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onDoubleClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />

            <div
              className="absolute inset-0 bottom-14 z-20"
              onPointerDown={handlePointerDown}
              onPointerUp={handleGesture}
              onDoubleClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              style={{
                touchAction: "none",
              }}
            />
          </>
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
            <h2 className="text-2xl font-bold mb-2">Watch Limit Reached</h2>

            <p className="text-muted-foreground mb-5">
              Your {user?.plan || "free"} plan watch time has been reached.
              Upgrade your plan to watch more videos.
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
