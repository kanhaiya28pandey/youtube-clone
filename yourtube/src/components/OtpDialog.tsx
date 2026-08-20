import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Mail, Smartphone, ShieldCheck } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  image: string;
  state: string;
  onSuccess: () => void;
}

const southStates = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
];

export default function OtpDialog({
  isOpen,
  onClose,
  email,
  name,
  image,
  state,
  onSuccess,
}: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isSouth = southStates.includes(state);

  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setOtpSent(false);
      setMessage("");
      setPhone("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!isSouth && !phone) {
        setMessage("Please enter your mobile number.");
        return;
      }

      const res = await axiosInstance.post("/otp/send", {
        email,
        phone,
        state,
        name,
      });

      if (res.data.success) {
        setOtpSent(true);
        setMessage(
          isSouth
            ? "OTP sent to your registered email address."
            : "OTP sent to your mobile number.",
        );
      }
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (otp.length !== 6) {
        setMessage("Please enter the 6-digit OTP.");
        return;
      }

      const res = await axiosInstance.post("/otp/verify", {
        email,
        phone,
        state,
        otp,
      });

      if (res.data.success) {
        setMessage("Verification successful!");

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-7 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {isSouth ? (
              <Mail className="h-7 w-7 text-primary" />
            ) : (
              <Smartphone className="h-7 w-7 text-primary" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Verify your login
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {isSouth
              ? "We've sent a verification code to your email."
              : "We've sent a verification code to your mobile."}
          </p>
        </div>

        {/* User information */}
        <div className="mx-7 mt-6 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-3">
            {image ? (
              <img src={image} alt={name} className="h-10 w-10 rounded-full" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {name?.[0] || "U"}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {name || "YourTube User"}
              </p>

              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        {/* Verification method */}
        <div className="px-7 pt-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-500" />

            <span>
              {isSouth
                ? `Email verification • ${state}`
                : `Mobile verification • ${state}`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-7 py-6">
          {!isSouth && !otpSent && (
            <>
              <label className="mb-2 block text-sm font-medium">
                Mobile number
              </label>

              <Input
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");

                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                className="h-11"
              />

              <Button
                className="mt-4 h-11 w-full"
                onClick={handleSendOTP}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          )}

          {isSouth && !otpSent && (
            <Button
              className="h-11 w-full"
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send Email OTP"}
            </Button>
          )}

          {otpSent && (
            <>
              <label className="mb-2 block text-sm font-medium">
                Enter verification code
              </label>

              <Input
                autoFocus
                maxLength={6}
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center text-xl tracking-[0.5em] font-semibold"
              />

              <Button
                className="mt-4 h-11 w-full"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="mt-4 w-full text-sm text-primary hover:underline"
              >
                Didn't receive the code? Resend OTP
              </button>
            </>
          )}

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.toLowerCase().includes("successful")
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-7 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            YourTube uses OTP verification to keep your account secure.
          </p>
        </div>
      </div>
    </div>
  );
}
