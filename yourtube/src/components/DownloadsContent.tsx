import { useEffect, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import Link from "next/link";

const DownloadsContent = () => {
  const { user } = useUser();

  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] =
  useState<string | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!user?._id) return;

      try {
        const res = await axiosInstance.get(
          `/download/${user._id}`
        );

        setDownloads(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user]);
  const handleRemoveDownload = async (
    videoid: string
  ) => {
    try {
      await axiosInstance.delete(
        `/download/${user._id}/${videoid}`
      );

      setDownloads((prev) =>
        prev.filter(
          (item) =>
            item.videoid._id !== videoid
        )
        
      );
      setOpenMenu(null);
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return <div>Loading downloads...</div>;
  }

  if (downloads.length === 0) {
    return <div>No downloaded videos yet.</div>;
  }

  return (
  <div className="space-y-4">
    {downloads.map((item) => (
      <div
        key={item._id}
        className="relative"
      >
        <Link
          href={`/watch/${item.videoid?._id}`}
        >
          <div className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">

            <video
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoid?.filepath}`}
              className="w-48 h-28 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="font-medium">
                {item.videoid?.videotitle}
              </h3>

              <p className="text-sm text-gray-600">
                {item.videoid?.videochanel}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Downloaded on{" "}
                {new Date(
                  item.downloadedAt
                ).toLocaleDateString()}
              </p>
            </div>

          </div>
        </Link>

        {/* 3 Dot Menu */}
        <button
          onClick={() =>
            setOpenMenu(
              openMenu === item._id
                ? null
                : item._id
            )
          }
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Popup Menu */}
        {openMenu === item._id && (
          <div
            className="
              absolute
              right-4
              top-14
              bg-white
              border
              rounded-xl
              shadow-lg
              z-50
              min-w-[220px]
            "
          >
            <button
              onClick={() =>
                handleRemoveDownload(
                  item.videoid._id
                )
              }
              className="
                flex
                items-center
                gap-3
                w-full
                px-4
                py-3
                hover:bg-gray-100
              "
            >
              <Trash2 className="w-5 h-5" />
              Delete from downloads
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
);
};

export default DownloadsContent;