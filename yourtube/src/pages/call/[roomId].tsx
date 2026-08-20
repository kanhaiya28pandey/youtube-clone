"use client";

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Circle,
  Square,
  Copy,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

const SOCKET_URL = "http://localhost:5000";

type CallStatus = "connecting" | "waiting" | "connected" | "ended";

export default function CallPage() {
  const router = useRouter();
  const { roomId } = router.query;

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const socketRef = useRef<Socket | null>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);

  const recordedChunksRef = useRef<Blob[]>([]);

  const recordingAnimationRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const [isMuted, setIsMuted] = useState(false);

  const [isCameraOff, setIsCameraOff] = useState(false);

  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const [callStatus, setCallStatus] = useState<CallStatus>("connecting");

  const [remoteConnected, setRemoteConnected] = useState(false);

  const [remoteMuted, setRemoteMuted] = useState(false);

  const [remoteCameraOff, setRemoteCameraOff] = useState(false);

  const [isEndingCall, setIsEndingCall] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [copied, setCopied] = useState(false);

  const startedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || typeof roomId !== "string") {
      return;
    }

    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    startCall();

    return () => {
      startedRef.current = false;
      stopEverything();
    };
  }, [router.isReady, roomId]);

  const startCall = async () => {
    try {
      setErrorMessage("");
      setCallStatus("connecting");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);

        setCallStatus("waiting");

        socket.emit("join-room", roomId);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);

        setErrorMessage("Unable to connect to the call server.");

        setCallStatus("ended");
      });

      const peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onconnectionstatechange = () => {
        console.log("WebRTC connection:", peer.connectionState);

        switch (peer.connectionState) {
          case "connected":
            setCallStatus("connected");
            setRemoteConnected(true);
            break;

          case "disconnected":
            setCallStatus("waiting");
            setRemoteConnected(false);
            break;

          case "failed":
            setCallStatus("waiting");
            setRemoteConnected(false);
            break;

          case "closed":
            setCallStatus("ended");
            setRemoteConnected(false);
            break;
        }
      };

      peer.ontrack = (event) => {
        console.log("Remote track received");

        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];

          setRemoteConnected(true);
          setCallStatus("connected");
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && socket.connected) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      socket.on("user-joined", async () => {
        try {
          console.log("Friend joined the room");

          const offer = await peer.createOffer();

          await peer.setLocalDescription(offer);

          socket.emit("offer", {
            roomId,
            offer,
          });
        } catch (error) {
          console.error("Offer creation error:", error);
        }
      });

      socket.on("offer", async (offer) => {
        try {
          console.log("Offer received");

          await peer.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("answer", {
            roomId,
            answer,
          });
        } catch (error) {
          console.error("Offer handling error:", error);
        }
      });

      socket.on("answer", async (answer) => {
        try {
          console.log("Answer received");

          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error("Answer handling error:", error);
        }
      });

      socket.on("ice-candidate", async (candidate) => {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("ICE candidate error:", error);
        }
      });

      socket.on("user-left", () => {
        console.log("Friend left the call");

        setRemoteConnected(false);
        setRemoteMuted(false);
        setRemoteCameraOff(false);
        setCallStatus("waiting");

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.on("toggle-microphone", ({ muted }) => {
        setRemoteMuted(Boolean(muted));
      });

      socket.on("toggle-camera", ({ cameraOff }) => {
        setRemoteCameraOff(Boolean(cameraOff));
      });

      socket.on("call-ended", () => {
        console.log("Friend ended the call");

        setCallStatus("ended");
        setRemoteConnected(false);

        stopEverything();

        setTimeout(() => {
          router.replace("/call");
        }, 500);
      });

      if (socket.connected) {
        setCallStatus("waiting");

        socket.emit("join-room", roomId);
      }
    } catch (error) {
      console.error("Call error:", error);

      setErrorMessage(
        "Camera or microphone permission is required to start the call.",
      );

      setCallStatus("ended");
    }
  };

  const toggleMicrophone = () => {
    if (!streamRef.current) {
      return;
    }

    const audioTracks = streamRef.current.getAudioTracks();

    if (audioTracks.length === 0) {
      return;
    }

    const newMutedState = audioTracks[0].enabled;

    audioTracks.forEach((track) => {
      track.enabled = !newMutedState;
    });

    setIsMuted(newMutedState);

    if (socketRef.current && typeof roomId === "string") {
      socketRef.current.emit("toggle-microphone", {
        roomId,
        muted: newMutedState,
      });
    }
  };

  const toggleCamera = () => {
    if (!streamRef.current) {
      return;
    }

    const videoTracks = streamRef.current.getVideoTracks();

    if (videoTracks.length === 0) {
      return;
    }

    const newCameraOffState = videoTracks[0].enabled;

    videoTracks.forEach((track) => {
      track.enabled = !newCameraOffState;
    });

    setIsCameraOff(newCameraOffState);

    if (socketRef.current && typeof roomId === "string") {
      socketRef.current.emit("toggle-camera", {
        roomId,
        cameraOff: newCameraOffState,
      });
    }
  };

  const startScreenShare = async () => {
    try {
      if (!peerRef.current || !streamRef.current) {
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = screenStream;

      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        return;
      }

      const sender = peerRef.current
        .getSenders()
        .find((item) => item.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.log("Screen sharing cancelled:", error);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (!peerRef.current || !streamRef.current) {
        return;
      }

      const cameraTrack = streamRef.current.getVideoTracks()[0];

      const sender = peerRef.current
        .getSenders()
        .find((item) => item.track?.kind === "video");

      if (sender && cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          track.onended = null;
          track.stop();
        });
      }

      screenStreamRef.current = null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error("Stop screen share error:", error);
    }
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        alert("Camera is not ready.");

        return;
      }

      if (!remoteVideoRef.current?.srcObject) {
        alert("Please wait until your friend joins the call.");

        return;
      }

      const localVideo = localVideoRef.current;

      const remoteVideo = remoteVideoRef.current;

      if (!localVideo || !remoteVideo) {
        return;
      }

      const remoteStream = remoteVideo.srcObject as MediaStream;

      const canvas = document.createElement("canvas");

      canvas.width = 1280;
      canvas.height = 720;

      const context = canvas.getContext("2d");

      if (!context) {
        alert("Recording is not supported.");

        return;
      }

      const drawVideos = () => {
        context.fillStyle = "black";

        context.fillRect(0, 0, canvas.width, canvas.height);

        if (remoteVideo.readyState >= 2) {
          context.drawImage(remoteVideo, 0, 0, canvas.width / 2, canvas.height);
        }

        if (localVideo.readyState >= 2) {
          context.drawImage(
            localVideo,
            canvas.width / 2,
            0,
            canvas.width / 2,
            canvas.height,
          );
        }

        recordingAnimationRef.current = requestAnimationFrame(drawVideos);
      };

      const canvasStream = canvas.captureStream(30);

      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        alert("Audio recording is not supported in this browser.");

        return;
      }

      const audioContext = new AudioContextClass();

      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const destination = audioContext.createMediaStreamDestination();

      const localAudioTracks = streamRef.current.getAudioTracks();

      if (localAudioTracks.length > 0) {
        const localAudioStream = new MediaStream(localAudioTracks);

        const localSource =
          audioContext.createMediaStreamSource(localAudioStream);

        localSource.connect(destination);
      }

      const remoteAudioTracks = remoteStream.getAudioTracks();

      if (remoteAudioTracks.length > 0) {
        const remoteAudioStream = new MediaStream(remoteAudioTracks);

        const remoteSource =
          audioContext.createMediaStreamSource(remoteAudioStream);

        remoteSource.connect(destination);
      }

      destination.stream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });

      let mimeType = "video/webm";

      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        mimeType = "video/webm;codecs=vp9,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
      });

      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (recordingAnimationRef.current) {
          cancelAnimationFrame(recordingAnimationRef.current);

          recordingAnimationRef.current = null;
        }

        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `yourtube-call-${Date.now()}.webm`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        if (audioContextRef.current) {
          audioContextRef.current.close();

          audioContextRef.current = null;
        }

        recordedChunksRef.current = [];

        recorderRef.current = null;

        setIsRecording(false);
      };

      recorder.onerror = (event) => {
        console.error("Recorder error:", event);

        setIsRecording(false);
      };

      recorderRef.current = recorder;

      recorder.start(1000);

      setIsRecording(true);

      drawVideos();

      console.log("Recording started");
    } catch (error) {
      console.error("Recording error:", error);

      alert("Recording could not be started.");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      return;
    }

    if (recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const copyRoomId = async () => {
    if (typeof roomId !== "string") {
      return;
    }

    try {
      await navigator.clipboard.writeText(roomId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const endCall = () => {
    if (isEndingCall) {
      return;
    }

    setIsEndingCall(true);
    setCallStatus("ended");

    if (socketRef.current && typeof roomId === "string") {
      socketRef.current.emit("call-ended", {
        roomId,
      });

      socketRef.current.emit("leave-room", roomId);
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    if (recordingAnimationRef.current) {
      cancelAnimationFrame(recordingAnimationRef.current);

      recordingAnimationRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });

      screenStreamRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.close();

      peerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();

      audioContextRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();

      socketRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setTimeout(() => {
      router.replace("/call");
    }, 300);
  };

  const stopEverything = () => {
    if (recordingAnimationRef.current) {
      cancelAnimationFrame(recordingAnimationRef.current);

      recordingAnimationRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch (error) {
        console.log("Recorder cleanup error:", error);
      }
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });

      screenStreamRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (peerRef.current) {
      try {
        peerRef.current.close();
      } catch (error) {
        console.log("Peer cleanup error:", error);
      }

      peerRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (error) {
        console.log("Socket cleanup error:", error);
      }

      socketRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.log("Audio cleanup error:", error);
      }

      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current && typeof roomId === "string") {
        socketRef.current.emit("call-ended", {
          roomId,
        });

        socketRef.current.emit("leave-room", roomId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId]);

  const getStatusContent = () => {
    if (callStatus === "connected") {
      return {
        icon: <Wifi className="w-4 h-4 text-green-400" />,
        text: "Connected",
        className: "text-green-400",
      };
    }

    if (callStatus === "waiting") {
      return {
        icon: <Users className="w-4 h-4 text-yellow-400" />,
        text: "Waiting for friend",
        className: "text-yellow-400",
      };
    }

    if (callStatus === "ended") {
      return {
        icon: <WifiOff className="w-4 h-4 text-red-400" />,
        text: "Call ended",
        className: "text-red-400",
      };
    }

    return {
      icon: <WifiOff className="w-4 h-4 text-blue-400" />,
      text: "Connecting...",
      className: "text-blue-400",
    };
  };

  const status = getStatusContent();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full flex justify-center px-3 sm:px-5 lg:px-8">
        <main className="w-full max-w-7xl py-5 sm:py-6 lg:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                YourTube Video Call
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[220px] sm:max-w-none">
                  Room: {roomId}
                </p>

                <button
                  onClick={copyRoomId}
                  title="Copy Call ID"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {copied && (
                  <span className="text-xs text-green-400">Copied</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording
                </div>
              )}

              <div className="flex items-center gap-2">
                {status.icon}

                <span
                  className={`text-xs sm:text-sm font-medium ${status.className}`}
                >
                  {status.text}
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <div className="relative bg-card rounded-2xl overflow-hidden aspect-video border border-border shadow-lg">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {!remoteConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card px-4 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
                  </div>

                  <p className="font-semibold text-base sm:text-lg">
                    Waiting for your friend
                  </p>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Share the Call ID to invite someone
                  </p>
                </div>
              )}

              {remoteCameraOff && remoteConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <VideoOff className="w-6 h-6 text-muted-foreground" />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Friend's camera is off
                  </p>
                </div>
              )}

              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm">
                  Friend
                </span>

                {remoteMuted && (
                  <span className="bg-black/70 backdrop-blur-sm p-2 rounded-full">
                    <MicOff className="w-4 h-4 text-red-400" />
                  </span>
                )}

                {remoteCameraOff && (
                  <span className="bg-black/70 backdrop-blur-sm p-2 rounded-full">
                    <VideoOff className="w-4 h-4 text-red-400" />
                  </span>
                )}
              </div>
            </div>

            <div className="relative bg-card rounded-2xl overflow-hidden aspect-video border border-border shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${
                  isCameraOff && !isScreenSharing ? "opacity-0" : ""
                }`}
              />

              {isCameraOff && !isScreenSharing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl sm:text-2xl font-bold mb-3">
                    Y
                  </div>

                  <p className="text-sm text-muted-foreground">Camera is off</p>
                </div>
              )}

              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm">
                  You
                </span>
              </div>

              {isScreenSharing && (
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
                    Screen Sharing
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-3 sm:bottom-4 z-20 flex justify-center mt-5 sm:mt-6 px-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-card/95 backdrop-blur-xl border border-border rounded-2xl px-3 py-3 shadow-2xl">
              <button
                onClick={toggleMicrophone}
                disabled={callStatus === "ended"}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
                  isMuted ? "bg-white text-black" : "bg-muted hover:bg-accent"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={toggleCamera}
                disabled={callStatus === "ended"}
                title={isCameraOff ? "Turn camera on" : "Turn camera off"}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
                  isCameraOff
                    ? "bg-white text-black"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {isCameraOff ? (
                  <VideoOff className="w-5 h-5" />
                ) : (
                  <Video className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                disabled={callStatus === "ended"}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
                  isScreenSharing
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={callStatus === "ended"}
                title={isRecording ? "Stop recording" : "Start recording"}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {isRecording ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5 text-red-400" />
                )}
              </button>

              <button
                onClick={endCall}
                disabled={isEndingCall}
                title="End call"
                className="w-11 h-10 sm:w-14 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 px-3 max-w-2xl mx-auto leading-relaxed">
            To share YouTube, choose the YouTube browser tab when your browser
            asks what you want to share.
          </p>
        </main>
      </div>
    </div>
  );
}
