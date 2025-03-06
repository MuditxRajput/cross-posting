import {
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
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (amount) => {
    const request = {
        body: {
            intent: "CAPTURE",
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: "USD", // ✅ Correctly using USD
                        value: amount.value,
                    },
                },
            ],
        },
        prefer: "return=minimal",
    };

    try {
        const { body, ...httpResponse } = await ordersController.ordersCreate(request);
        console.log("PayPal API Response:", body); // Debugging
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        console.error("Failed to create order:", error);
        throw new Error(error.message);
    }
};

// Next.js API route
export async function POST(req) {
    try {
        const data = await req.json();
        const { amount } = data;

        if (!amount) {
            return NextResponse.json(
                { error: "Amount data is required" },
                { status: 400 }
            );
        }

        const { jsonResponse, httpStatusCode } = await createOrder(amount);

        return NextResponse.json(
            { jsonResponse, msg: "Order created successfully" },
            { status: httpStatusCode }
        );
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json(
            { error: "Failed to create order", details: error.message },
            { status: 500 }
        );
    }
}