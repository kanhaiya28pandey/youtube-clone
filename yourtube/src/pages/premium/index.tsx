import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import loadRazorpay from "@/lib/loadRazorpay";
import { useUser } from "@/lib/AuthContext";
import { useState } from "react";

export default function PremiumPage() {
  const { user } = useUser();
  const currentPlan = user?.plan || "free";
  const [selectedPlan, setSelectedPlan] =
    useState("bronze");

  const handlePayment = async () => {
    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Failed to load Razorpay");
        return;
      }

      const { data } = await axiosInstance.post(
        "/payment/create-order",
        {
          plan: selectedPlan,
        }
      );

      console.log("Frontend Razorpay Key:");
      console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
      console.log("Order Data:");
      console.log(data);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: data.amount,

        currency: data.currency,

        name: "YourTube Premium",

        description: "Premium Subscription",

        order_id: data.id,

        handler: async function (response) {
          try {
            console.log("Payment Response:", response);

            const res = await axiosInstance.post(
              "/payment/upgrade",
              {
                userId: user?._id || user?.id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                plan: selectedPlan,
              }
            );

            console.log("Upgrade Success:", res.data);

            alert("Premium Activated Successfully!");

            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error) {
            console.log("Upgrade Error:", error);

            console.log(
              "Backend Response:",
              error?.response?.data
            );

            alert(
              error?.response?.data?.message ||
              "Payment failed. Try again."
            );
          }
        },

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "9999999999",
        },

        theme: {
          color: "#2563eb",
        },
      };

      const paymentObject = new (window as any).Razorpay(
        options
      );

      paymentObject.open();
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <main className="flex justify-center items-center w-full min-h-[calc(100vh-80px)] bg-zinc-50">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-3xl border shadow-lg p-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Crown className="w-6 h-6 text-red-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Choose Your Plan
                </h1>

                <p className="text-sm text-gray-500">
                  Upgrade for more watch time and premium benefits
                </p>
              </div>
            </div>

            <span className="text-xs px-3 py-1 border border-blue-500 text-blue-500 rounded-full">
              New
            </span>
          </div>

          <hr className="my-5" />

          {/* Pricing */}
          {/* Plans */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-center mb-4">
              Choose Your Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Bronze */}
              {currentPlan === "free" && (
                <div
                  onClick={() => setSelectedPlan("bronze")}
                  className={`
        cursor-pointer
        rounded-2xl
        border
        p-4
        transition-all
        hover:shadow-md
        ${selectedPlan === "bronze"
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                    }
      `}
                >
                  <h3 className="text-lg font-bold">
                    Bronze
                  </h3>

                  <p className="text-3xl font-bold mt-2">
                    ₹10
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    7 Minutes Watch Time
                  </p>
                </div>
              )}

              {/* Silver */}
              {["free", "bronze"].includes(currentPlan) && (
                <div
                  onClick={() => setSelectedPlan("silver")}
                  className={`
        cursor-pointer
        rounded-2xl
        border
        p-4
        transition-all
        hover:shadow-md
        ${selectedPlan === "silver"
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200"
                    }
      `}
                >
                  <h3 className="text-lg font-bold">
                    Silver
                  </h3>

                  <p className="text-3xl font-bold mt-2">
                    ₹50
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    10 Minutes Watch Time
                  </p>
                </div>
              )}

              {/* Gold */}
              {["free", "bronze", "silver"].includes(currentPlan) && (
                <div
                  onClick={() => setSelectedPlan("gold")}
                  className={`
        relative
        cursor-pointer
        rounded-2xl
        border
        p-4
        transition-all
        hover:shadow-md
        ${selectedPlan === "gold"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200"
                    }
      `}
                >
                  <span className="absolute top-1 right-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                    Popular
                  </span>

                  <h3 className="text-lg font-bold">
                    Gold
                  </h3>

                  <p className="text-3xl font-bold mt-2">
                    ₹100
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Unlimited Watch Time
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Features */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Unlimited Downloads</span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Watch Time Based On Plan</span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Invoice On Upgrade</span>
            </div>
          </div>

          {/* Premium Status */}

          {currentPlan === "gold" ? (
            <div className="mt-6 bg-green-100 text-green-700 text-center p-3 rounded-xl font-semibold">
              👑 Professional Member
              <br />
              Unlimited Watch Time Active
            </div>
          ) : (
            <Button
              onClick={handlePayment}
              className="
      w-full
      mt-6
      bg-blue-600
      hover:bg-blue-700
      text-white
      rounded-full
      py-6
      text-lg
      font-semibold
    "
            >
              Upgrade to {selectedPlan}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}