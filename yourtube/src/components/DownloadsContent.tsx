import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import Link from "next/link";

const DownloadsContent = () => {
  const { user } = useUser();

  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading downloads...</div>;
  }

  if (downloads.length === 0) {
    return <div>No downloaded videos yet.</div>;
  }

  return (
    <div className="space-y-4">
      {downloads.map((item) => (
        <Link
          key={item._id}
          href={`/watch/${item.videoid?._id}`}
        >
          <div className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <video
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoid?.filepath}`}
              className="w-48 h-28 object-cover rounded"
            />

            <div>
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
      ))}
    </div>
  );
};

export default DownloadsContent;