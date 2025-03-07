"use client";

import { useToast } from "@/hooks/use-toast";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PaymentCards = () => {
  const { toast } = useToast();

  // PayPal client ID (replace with your own)
  // const paypalClientId = "AcQOkCwvFdpyOBH072WZIXV4kAbxw7AqQpFW7wP-n-3jdShOadiuJ7S0P7UzxaGdLn_8mwUa5PWSXLAQ";
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <div className="flex justify-center items-center p-6">
      <div className="w-[300px] border rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">One-Time Payment</h2>
        <p className="text-3xl font-bold mb-4">$10.00</p>
        <ul className="mb-4 space-y-2">
          <li>✅ Feature 1</li>
          <li>✅ Feature 2</li>
          <li>✅ Feature 3</li>
        </ul>

        {/* PayPal Button */}
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
            createOrder={async () => {
              try {
                const response = await fetch("https://cross-posting-web.vercel.app/api/order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: { currency_code: "USD", value: "10.00" } }), // ✅ Correctly using USD
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
            onApprove={async (data, actions) => {
              try {
                console.log("Approving payment for Order ID:", data.orderID);
                console.log("data=>>>",data);
                const response = await fetch(`https://cross-posting-web.vercel.app/api/orders/${data.orderID}/capture`, {
                  method: "POST", // Use POST instead of PUT
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