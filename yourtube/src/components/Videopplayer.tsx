"use client";

import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videos = "/video/vdo.mp4";

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {video?.filepath ? (
        <video
          controls
          autoPlay
          className="w-full h-full"
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
        />
      ) : (
        <div>No video available</div>
      )}
    </div>
  );
}
