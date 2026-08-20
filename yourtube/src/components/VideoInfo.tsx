import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Check,
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        try {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        return await axiosInstance.post(`/history/views/${video?._id}`);
      }
    };
    handleviews();
  }, [user]);
  useEffect(() => {
    if (!user || !video?._id) return;

    const checkDownload = async () => {
      try {
        const res = await axiosInstance.get(`/download/check/${video._id}`);

        if (res.data.downloaded) {
          setIsDownloaded(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkDownload();
  }, [user, video]);
  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDownload = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      const res = await axiosInstance.post("/download", {
        videoid: video._id,
      });

      if (res.data.success) {
        setIsDownloaded(true);

        const videoResponse = await axiosInstance.get(
          `/download/file/${video._id}`,
          {
            responseType: "blob",
          },
        );

        const blob = new Blob([videoResponse.data], {
          type: video.filetype || "video/mp4",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = video.filename || `${video.videotitle}.mp4`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Download failed";

      if (
        error?.response?.status === 403 &&
        error?.response?.data?.limitReached
      ) {
        const upgradePlan = confirm(
          "You've reached your daily download limit. Upgrade to Premium for unlimited downloads. Click OK to view premium plans.",
        );

        if (upgradePlan) {
          window.location.href = "/premium";
        }
      } else {
        alert(errorMsg);
      }

      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="space-y-4 w-full min-w-0 overflow-hidden">
      <h1 className="text-xl font-semibold break-words">{video.videotitle}</h1>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full min-w-0">
        {/* Channel section */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback>{video.videochanel?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="font-medium truncate">{video.videochanel}</h3>

            <p className="text-sm text-muted-foreground truncate">
              1.2M subscribers
            </p>
          </div>

          <Button variant="default" className="shrink-0 ml-1 sm:ml-2">
            Subscribe
          </Button>
        </div>

        {/* Action buttons */}
        <div className="w-full xl:w-auto min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            <div className="flex items-center bg-card rounded-full shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="bg-muted text-foreground rounded-full hover:bg-accent"
                onClick={handleLike}
              >
                <ThumbsUp
                  className={`w-5 h-5 mr-2 ${
                    isLiked ? "fill-current text-primary" : ""
                  }`}
                />
                {likes.toLocaleString()}
              </Button>

              <div className="w-px h-6 bg-border shrink-0" />

              <Button
                variant="ghost"
                size="sm"
                className="bg-muted text-foreground rounded-full hover:bg-accent"
                onClick={handleDislike}
              >
                <ThumbsDown
                  className={`w-5 h-5 mr-2 ${
                    isDisliked ? "fill-current text-primary" : ""
                  }`}
                />
                {dislikes.toLocaleString()}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`bg-muted text-foreground rounded-full hover:bg-accent shrink-0 ${
                isWatchLater ? "text-primary" : ""
              }`}
              onClick={handleWatchLater}
            >
              <Clock className="w-5 h-5 mr-2" />
              {isWatchLater ? "Saved" : "Watch Later"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-foreground rounded-full hover:bg-accent shrink-0"
            >
              <Share className="w-5 h-5 mr-2" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={isDownloaded}
              onClick={handleDownload}
              className="bg-muted text-foreground rounded-full hover:bg-accent shrink-0"
            >
              {isDownloaded ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}

              {isDownloaded ? "Downloaded" : "Download"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="bg-muted text-foreground rounded-full hover:bg-accent shrink-0"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-card rounded-lg p-4 border border-border w-full min-w-0">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium mb-2">
          <span>{video?.views?.toLocaleString?.() || 0} views</span>

          <span>
            {video?.createdAt
              ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
              : "Recently uploaded"}
          </span>
        </div>

        <div
          className={`text-sm break-words ${
            showFullDescription ? "" : "line-clamp-3"
          }`}
        >
          <p>
            Sample video description. This would contain the actual video
            description from the database.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="bg-muted text-foreground rounded-full hover:bg-accent mt-2"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
