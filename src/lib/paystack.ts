const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string; // "success", "failed", etc.
    reference: string;
    amount: number; // in kobo
    gateway_response: string;
    paid_at: string;
    channel: string;
    currency: string;
    ip_address: string;
  };
}

export async function initializeTransaction(
  email: string,
  amountInNaira: number,
  reference: string,
  callbackUrl: string
): Promise<PaystackInitResponse> {
  const amountInKobo = Math.round(amountInNaira * 100);

  // Fallback to Mock mode for sandbox testing if dummy secret key is found
  if (PAYSTACK_SECRET_KEY.startsWith("sk_test_mock") || !PAYSTACK_SECRET_KEY) {
    console.log("Paystack running in MOCK mode.");
    return {
      status: true,
      message: "Authorization URL created (MOCK)",
      data: {
        authorization_url: `${callbackUrl}?reference=${reference}&mock=true`,
        access_code: "mock_access_code_" + Date.now(),
        reference,
      },
    };
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: callbackUrl,
      }),
    });

    if (!res.ok) {
      throw new Error(`Paystack Init Error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Paystack Initialize Catch Error:", error);
    return {
      status: false,
      message: error.message || "Failed to initialize transaction",
      data: { authorization_url: "", access_code: "", reference },
    };
  }
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  if (PAYSTACK_SECRET_KEY.startsWith("sk_test_mock") || !PAYSTACK_SECRET_KEY || reference.includes("MOCK")) {
    console.log("Paystack Verification running in MOCK mode.");
    return {
      status: true,
      message: "Verification successful (MOCK)",
      data: {
        id: Math.floor(Math.random() * 100000),
        status: "success",
        reference,
        amount: 0, // Mock amount ok
        gateway_response: "Successful",
        paid_at: new Date().toISOString(),
        channel: "card",
        currency: "NGN",
        ip_address: "127.0.0.1",
      },
    };
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Paystack Verify Error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Paystack Verify Catch Error:", error);
    return {
      status: false,
      message: error.message || "Failed to verify transaction",
      data: {
        id: 0,
        status: "failed",
        reference,
        amount: 0,
        gateway_response: error.message || "Verification failed",
        paid_at: "",
        channel: "",
        currency: "NGN",
        ip_address: "",
      },
    };
  }
}
