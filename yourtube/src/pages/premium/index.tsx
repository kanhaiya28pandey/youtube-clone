import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import loadRazorpay from "@/lib/loadRazorpay";
import { useUser } from "@/lib/AuthContext";

export default function PremiumPage() {
  
  const { user } = useUser();

  const handlePayment = async () => {
    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Failed to load Razorpay");
        return;
      }

      const { data } = await axiosInstance.post(
        "/payment/create-order"
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
            await axiosInstance.post(
              "/payment/upgrade",
              {
                userId: user?._id || user?.id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }
            );

            alert(
              "Premium Activated Successfully!"
            );

            window.location.reload();
          } catch (error) {
            console.log(error);
            alert(
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
                  Premium
                </h1>

                <p className="text-sm text-gray-500">
                  Unlimited Downloads
                </p>
              </div>
            </div>

            <span className="text-xs px-3 py-1 border border-blue-500 text-blue-500 rounded-full">
              New
            </span>
          </div>

          <hr className="my-5" />

          {/* Pricing */}
          <div>
            <p className="text-gray-500 text-sm">
              Monthly Plan
            </p>

            <h2 className="text-4xl font-bold mt-1">
              ₹99
              <span className="text-lg font-normal">
                /month
              </span>
            </h2>

            <p className="text-green-600 mt-2 text-sm">
              Unlimited access after upgrade
            </p>
          </div>

          {/* Features */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Unlimited Downloads</span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>No Daily Download Limit</span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Future Premium Features</span>
            </div>
          </div>

          {/* Premium Status */}
          {user?.isPremium ? (
            <div className="mt-6 bg-green-100 text-green-700 text-center p-3 rounded-xl font-semibold">
              ✅ You are already a Premium Member
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
              Upgrade Now
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}