import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown } from "lucide-react";
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  likes: number;
  dislikes: number;
  city?: string;
}
const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [translatedComments, setTranslatedComments] = useState<{
    [key: string]: string;
  }>({});
  const [selectedLanguages, setSelectedLanguages] =
    useState<{ [key: string]: string }>({});
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const fetchedComments = [
    {
      _id: "1",
      videoid: videoId,
      userid: "1",
      commentbody: "Great video! Really enjoyed watching this.",
      usercommented: "John Doe",
      commentedon: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: "2",
      videoid: videoId,
      userid: "2",
      commentbody: "Thanks for sharing this amazing content!",
      usercommented: "Jane Smith",
      commentedon: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "fr", label: "French" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
    { code: "mr", label: "Marathi" },
    { code: "kn", label: "Kannada" },
    { code: "ml", label: "Malayalam" },
    { code: "ko", label: "Korean" },
    { code: "ja", label: "Japanese" },
    { code: "zh-CN", label: "Chinese" },
    { code: "ru", label: "Russian" },
    { code: "bn", label: "Bengali" },
    { code: "es", label: "Spanish" },
    { code: "ur", label: "Urdu" },
    { code: "ar", label: "Standard Arabic" },
    { code: "pt", label: "Portuguese" },
    { code: "de", label: "German" },
  ];
  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div>Loading history...</div>;
  }
  const getCityName = async () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
            );

            const data = await response.json();

            resolve(
              data.address.city ||
              data.address.town ||
              data.address.state ||
              "Unknown"
            );
          } catch (error) {
            console.log(error);
            resolve("Unknown");
          }
        },
        () => {
          resolve("Unknown");
        }
      );
    });
  };
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    const city = await getCityName();

    try {
      setErrorMessage("");

      const response = await axiosInstance.post(
        "/comment/postcomment",
        {
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name,
          city,
        },
        {
          validateStatus: () => true,
        }
      );
      if (response.status !== 200) {
        setErrorMessage(
          response.data?.message ||
          "Failed to add comment"
        );

        setIsSubmitting(false);

        return;
      }
      await loadComments();

      setNewComment("");
    } catch (error: any) {
      console.error("Error adding comment:", error);

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to add comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleReaction = async (
    commentId: string,
    type: "like" | "dislike"
  ) => {
    try {
      const res = await axiosInstance.patch(
        `/comment/reaction/${commentId}`,
        {
          type,
        }
      );

      // comment deleted automatically
      if (res.data.deleted) {
        setComments((prev) =>
          prev.filter((c) => c._id !== commentId)
        );

        return;
      }

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? res.data : c
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleTranslate = async (
    commentId: string,
    text: string
  ) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${selectedLanguages[commentId] || "en"
        }&dt=t&q=${encodeURIComponent(text)}`
      );

      const data = await response.json();

      const translatedText = data[0]
        .map((item: any) => item[0])
        .join("");

      setTranslatedComments((prev) => ({
        ...prev,
        [commentId]: translatedText,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user !== null && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            {errorMessage && (
              <p className="text-sm text-red-500">
                {errorMessage}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.usercommented} • {comment.city || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{comment.commentbody}</p>
                    {translatedComments[comment._id] && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        {translatedComments[comment._id]}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() =>
                          handleReaction(comment._id, "like")
                        }
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {comment.likes}
                      </button>

                      <button
                        onClick={() =>
                          handleReaction(comment._id, "dislike")
                        }
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        {comment.dislikes}
                      </button>

                      <select
                        value={selectedLanguages[comment._id] || "en"}
                        onChange={(e) =>
                          setSelectedLanguages((prev) => ({
                            ...prev,
                            [comment._id]: e.target.value,
                          }))
                        }
                        className="border rounded-md px-2 py-1 text-sm w-28 bg-white"
                      >
                        {languages.map((lang) => (
                          <option
                            key={lang.code}
                            value={lang.code}
                          >
                            {lang.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          handleTranslate(
                            comment._id,
                            comment.commentbody
                          )
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Translate
                      </button>
                    </div>
                    {comment.userid === user?._id && (
                      <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <button onClick={() => handleEdit(comment)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(comment._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
