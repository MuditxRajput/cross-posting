import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { NextResponse } from "next/server";

// Initialize PayPal client
const client = new Client({
  clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID || "",
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  },
  timeout: 0,
  environment: Environment.Live,
  logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);

/**
* Capture an order to complete the transaction.
* @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
*/
const captureOrder = async (orderID) => {
  // Important: Match the exact structure from PayPal's example
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  try {
      // Use the collect object directly, just like in PayPal's sample code
      const response = await ordersController.ordersCapture(collect);
      const { body, ...httpResponse } = response;
      
      console.log("PayPal response body:", body);
      return {
          jsonResponse: JSON.parse(body),
          httpStatusCode: httpResponse.statusCode,
      };
  } catch (error) {
      console.error("Error in captureOrder:", error);
      if (error instanceof ApiError) {
          console.error("PayPal API Error:", error.message);
      }
      // Re-throw the error to be caught by the route handler
      throw error;
  }
};

// Next.js API route
export async function POST(req, { params }) {
  try {
    console.log("Inside the capture route");
    console.log("params:", params);
    
    // Extract the orderID from params
    const { orderID } = params;
    console.log("Order ID extracted:", orderID);
    
    if (!orderID) {
        return NextResponse.json(
            { error: "Order ID is required." },
            { status: 400 }
        );
    }

    const result = await captureOrder(orderID);
    console.log("Capture result:", result);
    
    return NextResponse.json(
        { jsonResponse: result.jsonResponse, msg: "Order captured successfully" },
        { status: result.httpStatusCode }
    );
  } catch (error) {
      console.error("Failed to capture order:", error);
      return NextResponse.json(
          { error: "Failed to capture order", details: error.message },
          { status: 500 }
      );
  }
}