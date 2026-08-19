"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Video, Users, Copy, ArrowRight } from "lucide-react";
import { useUser } from "@/lib/AuthContext";

export default function CallDashboard() {
  const router = useRouter();
  const { user } = useUser();

  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const createCall = () => {
    const randomId = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const newRoomId = `YT-${randomId}`;

    router.push(`/call/${newRoomId}`);
  };

  const joinCall = () => {
    const cleanRoomId = roomId.trim().toUpperCase();

    if (!cleanRoomId) {
      alert("Please enter a Call ID.");
      return;
    }

    router.push(`/call/${cleanRoomId}`);
  };

  const copyRoomId = async () => {
    if (!roomId) {
      return;
    }

    await navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 sm:px-6 lg:px-10">
      
      {/* Header */}

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Video Calls
          </h1>

          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Connect with your friends through a secure video call.
          </p>
        </div>

        {/* User */}

        {user && (
          <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div>
                <p className="font-semibold">
                  {user.name || "User"}
                </p>

                <p className="text-sm text-gray-400">
                  Ready to make a call
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Create Call */}

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
            
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-5">
              <Video className="w-6 h-6 text-blue-400" />
            </div>

            <h2 className="text-xl font-semibold mb-2">
              Start a new call
            </h2>

            <p className="text-gray-400 text-sm leading-6 mb-6">
              Create a new call and share the Call ID with your
              friend.
            </p>

            <button
              onClick={createCall}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition px-5 py-3 font-medium flex items-center justify-center gap-2"
            >
              Create Call
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          {/* Join Call */}

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">

            <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-5">
              <Users className="w-6 h-6 text-green-400" />
            </div>

            <h2 className="text-xl font-semibold mb-2">
              Join a call
            </h2>

            <p className="text-gray-400 text-sm leading-6 mb-6">
              Enter the Call ID shared by your friend.
            </p>

            <div className="flex gap-2">

              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Example: YT-7K92PX"
                className="flex-1 min-w-0 rounded-xl bg-black border border-gray-700 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={copyRoomId}
                disabled={!roomId}
                className="px-4 rounded-xl border border-gray-700 hover:bg-gray-800 disabled:opacity-40"
                title="Copy Call ID"
              >
                <Copy className="w-5 h-5" />
              </button>

            </div>

            {copied && (
              <p className="text-green-400 text-xs mt-2">
                Call ID copied.
              </p>
            )}

            <button
              onClick={joinCall}
              className="w-full mt-4 rounded-xl bg-green-600 hover:bg-green-700 transition px-5 py-3 font-medium flex items-center justify-center gap-2"
            >
              Join Call
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* How it works */}

        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

          <h3 className="font-semibold mb-4">
            How it works
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <p className="text-blue-400 font-semibold">
                01
              </p>

              <p className="text-sm text-gray-300 mt-1">
                Create a call
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Generate a unique Call ID.
              </p>
            </div>

            <div>
              <p className="text-blue-400 font-semibold">
                02
              </p>

              <p className="text-sm text-gray-300 mt-1">
                Share the ID
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Send the Call ID to your friend.
              </p>
            </div>

            <div>
              <p className="text-blue-400 font-semibold">
                03
              </p>

              <p className="text-sm text-gray-300 mt-1">
                Start talking
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Both users join the same room.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}