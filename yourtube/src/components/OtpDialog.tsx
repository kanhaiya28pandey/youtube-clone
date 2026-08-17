import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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

  if (!isOpen) return null;

  const isSouth = southStates.includes(state);

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/otp/send", {
        email,
        phone,
        state,
        name,
      });

      alert(res.data.message);

      setOtpSent(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/otp/verify", {
        email,
        phone,
        state,
        otp,
      });

      if (res.data.success) {
        alert("OTP Verified");

        onSuccess();

        onClose();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl p-6 w-[420px]">

        <h2 className="text-2xl font-bold mb-5">
          Verify Login
        </h2>

        <p className="mb-2">
          <b>Email:</b> {email}
        </p>

        <p className="mb-5">
          <b>State:</b> {state}
        </p>

        {!isSouth && !otpSent && (
          <>
            <Input
              placeholder="Enter Mobile Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

            <Button
              className="w-full mt-5"
              onClick={handleSendOTP}
              disabled={loading}
            >
              Send OTP
            </Button>
          </>
        )}

        {isSouth && !otpSent && (
          <Button
            className="w-full"
            onClick={handleSendOTP}
            disabled={loading}
          >
            Send Email OTP
          </Button>
        )}

        {otpSent && (
          <>
            <Input
              className="mt-4"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
            />

            <Button
              className="w-full mt-5"
              onClick={handleVerify}
              disabled={loading}
            >
              Verify OTP
            </Button>
          </>
        )}

      </div>

    </div>
  );
}