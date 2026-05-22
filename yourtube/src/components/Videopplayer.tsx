"use client";

import { useRef } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const hasViewed = useRef(false);

  const handleView = async () => {
    // already counted
    if (hasViewed.current) return;

    // check browser session
    const viewed = sessionStorage.getItem(`viewed-${video._id}`);

    if (viewed) return;

    hasViewed.current = true;

    sessionStorage.setItem(`viewed-${video._id}`, "true");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/video/view/${video._id}`,
        {
          method: "PATCH",
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {video?.filepath ? (
        <video
          controls
          className="w-full h-full"
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
          onPlaying={handleView}
        />
      ) : (
        <div>No video available</div>
      )}
    </div>
  );
}