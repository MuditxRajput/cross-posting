"use client";

import { useToast } from "@/hooks/use-toast";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PaymentCards = () => {
  const { toast } = useToast();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Premium Access</h2>
        <p className="text-4xl font-extrabold text-blue-600 mb-4">$10.00</p>
        <p className="text-gray-500 mb-6">One-time payment, no hidden fees.</p>

        <ul className="mb-6 text-gray-700 space-y-3 text-left">
          <li className="flex items-center">
            ✅ <span className="ml-2">Lifetime free credits</span>
          </li>
          <li className="flex items-center">
            ✅ <span className="ml-2">Post unlimited content</span>
          </li>
          <li className="flex items-center">
            ✅ <span className="ml-2">Share across multiple platforms</span>
          </li>
          <li className="flex items-center">
            ✅ <span className="ml-2">Boost audience reach effortlessly</span>
          </li>
        </ul>

        {/* PayPal Button */}
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
            createOrder={async () => {
              try {
                const response = await fetch("/api/order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: { currency_code: "USD", value: "10.00" } }),
                });

                const orderData = await response.json();
                console.log("Order Data:", orderData);

                if (orderData.jsonResponse.id) {
                  return orderData.jsonResponse.id;
                } else {
                  throw new Error("Failed to create order");
                }
              } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Failed to create PayPal order." });
              }
            }}
            onApprove={async (data) => {
              try {
                console.log("Approving payment for Order ID:", data.orderID);

                const response = await fetch(`/api/orders/${data.orderID}/capture`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderID: data.orderID }),
                });

                const captureData = await response.json();
                console.log("Capture Response:", captureData);

                if (captureData.jsonResponse.status === "COMPLETED") {
                  toast({ title: "Success", description: "Payment successful!" });
                } else {
                  throw new Error("Payment not completed");
                }
              } catch (error) {
                console.error("Payment error:", error);
                toast({ title: "Error", description: "Payment failed. Please try again." });
              }
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

export default PaymentCards;
