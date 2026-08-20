import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import OtpDialog from "./OtpDialog";

const Header = () => {
  const {
    user,
    logout,
    handlegooglesignin,
    completeLogin,
    pendingLogin,
    remainingWatchSeconds,
  } = useUser();
  console.log("USER:", user);
  console.log("limit:", user?.watchTimeLimit, "used:", user?.watchTimeUsed);

  const [searchQuery, setSearchQuery] = useState("");

  const [isdialogeopen, setisdialogeopen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };
  const showOtpDialog = !!pendingLogin;
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-foreground">
          <Menu className="w-6 h-6" />
        </Button>

        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>

          <span className="text-xl font-medium text-foreground">YourTube</span>

          <span className="text-xs text-muted-foreground ml-1">IN</span>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
      >
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-l-full border-r-0 focus-visible:ring-0"
          />

          <Button
            type="submit"
            className="
            rounded-r-full
            px-6
            bg-muted
            hover:bg-accent
            text-foreground
            border
            border-l-0
            border-border
          "
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="hidden md:flex items-center gap-2">
              {user.plan !== "gold" && (
                <div
                  className="
                  bg-blue-100
                  text-blue-700
                  px-3
                  py-1
                  rounded-full
                  text-sm
                  font-semibold
                "
                >
                  ⏳{" "}
                  {remainingWatchSeconds !== null
                    ? `${Math.floor(remainingWatchSeconds / 60)}:${Math.floor(
                        remainingWatchSeconds % 60,
                      )
                        .toString()
                        .padStart(2, "0")} left`
                    : "0:00 left"}
                </div>
              )}

              <div
                className={`
                px-3
                py-1
                rounded-full
                text-sm
                font-semibold

                ${
                  user.plan === "gold"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : user.plan === "silver"
                      ? "bg-muted text-foreground border border-gray-500/30"
                      : user.plan === "bronze"
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-muted text-foreground border border-border"
                }
              `}
              >
                {user.plan === "gold"
                  ? "🥇 Gold"
                  : user.plan === "silver"
                    ? "🥈 Silver"
                    : user.plan === "bronze"
                      ? "🥉 Bronze"
                      : "🆓 Free"}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/call")}
              className="rounded-full"
              title="Video Call"
            >
              <VideoIcon className="w-6 h-6" />
            </Button>

            <Button variant="ghost" size="icon" className="text-foreground">
              <Bell className="w-6 h-6" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />

                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="
                w-56
                bg-popover
                text-popover-foreground
                border-border
              "
              >
                {user.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setisdialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/downloads">Downloads</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/premium">
                    {user.isPremium
                      ? "👑 Premium Active"
                      : "⭐ Upgrade to Premium"}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            className="
            flex
            items-center
            gap-2
            bg-primary
            text-primary-foreground
          "
            onClick={handlegooglesignin}
          >
            <User className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </div>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
      {showOtpDialog && pendingLogin && (
        <OtpDialog
          isOpen={showOtpDialog}
          onClose={() => {}}
          email={pendingLogin.email}
          name={pendingLogin.name}
          image={pendingLogin.image}
          state={pendingLogin.state}
          onSuccess={completeLogin}
        />
      )}
    </header>
  );
};

export default Header;
