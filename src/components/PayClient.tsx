"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, ChevronRight, CheckCircle, AlertTriangle, X, Loader2 } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { useStore } from "./StoreContext";

interface OrderItem {
  id: number;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  address: string | null;
  city: string | null;
  state: string | null;
  additionalInstructions: string | null;
  items: OrderItem[];
}

interface PayClientProps {
  order: Order;
  checkoutUrl: string;
  reference: string;
  publicKey: string;
  initialError?: string;
}

export default function PayClient({ order, checkoutUrl, reference, publicKey, initialError }: PayClientProps) {
  const router = useRouter();
  const { clearCart } = useStore();

  const [verifying, setVerifying] = useState(false);
  const [verifyingMessage, setVerifyingMessage] = useState("");
  const [showMockModal, setShowMockModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureError, setFailureError] = useState(initialError || "");

  // Load Paystack inline script dynamically for real keys
  useEffect(() => {
    if (publicKey && !publicKey.startsWith("pk_test_mock")) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => {
        console.warn("Paystack inline script failed to load (blocked by an extension/network?). Falling back to hosted checkout on payment click.");
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [publicKey]);

  // Handle Payment Initiation
  const handlePayment = () => {
    setFailureError("");

    if (!publicKey || publicKey.startsWith("pk_test_mock")) {
      // Open Mock Payment Modal
      setShowMockModal(true);
    } else {
      // Use official Paystack Pop inline script
      if (typeof window !== "undefined" && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          key: publicKey,
          email: order.customerEmail,
          amount: Math.round(order.total * 100), // in kobo
          ref: reference,
          callback: async (response: any) => {
            await verifyTransactionOnServer(response.reference);
          },
          onClose: () => {
            setFailureError("Payment window was closed before completion.");
            setShowFailureModal(true);
          },
        });
        handler.openIframe();
      } else {
        // Fallback to URL redirection if script didn't load
        window.location.href = checkoutUrl;
      }
    }
  };

  // Call server to verify payment status
  const verifyTransactionOnServer = async (ref: string, statusOverride?: string) => {
    setVerifying(true);
    setVerifyingMessage("Verifying your payment with Paystack...");
    try {
      let url = `/api/checkout/verify?reference=${ref}&json=true`;
      if (statusOverride) {
        url += `&status=${statusOverride}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        setShowSuccessModal(true);
      } else {
        setFailureError(data.error || "The payment verification failed.");
        setShowFailureModal(true);
      }
    } catch (err) {
      console.error(err);
      setFailureError("An error occurred while verifying the payment. Please try again.");
      setShowFailureModal(true);
    } finally {
      setVerifying(false);
      setVerifyingMessage("");
    }
  };

  // Mock Simulations
  const simulateSuccess = async () => {
    setShowMockModal(false);
    await verifyTransactionOnServer(reference);
  };

  const simulateFailure = async () => {
    setShowMockModal(false);
    await verifyTransactionOnServer(reference, "failed");
  };

  const simulateCancel = () => {
    setShowMockModal(false);
    setFailureError("Mock payment transaction was cancelled by user.");
    setShowFailureModal(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Step Indicator */}
      <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-brand-charcoal/50 mb-8 justify-center sm:justify-start">
        <span>Cart</span>
        <ChevronRight className="h-3 w-3" />
        <span>Checkout details</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-burgundy font-medium">Payment Review</span>
      </div>

      <div className="bg-brand-cream border border-brand-burgundy/10 shadow-sm p-6 sm:p-10 space-y-8 relative">
        {/* Loading Overlay */}
        {verifying && (
          <div className="absolute inset-0 bg-brand-cream/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 text-brand-burgundy animate-spin" />
            <p className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-semibold">
              {verifyingMessage}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center sm:text-left space-y-2">
          <h1 className="font-serif text-3xl text-brand-burgundy">Review & Pay</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50">
            Order Number: {order.orderNumber}
          </p>
        </div>

        {/* Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Customer Details */}
          <div className="space-y-4 text-sm font-light text-brand-charcoal/80">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold border-b border-brand-burgundy/5 pb-2">
              Billing & Delivery
            </h3>
            
            <div className="space-y-1">
              <p className="font-medium text-brand-charcoal">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>

            <div className="pt-2 space-y-1">
              <p className="text-xs uppercase tracking-wider text-brand-charcoal/50">Delivery Method</p>
              <p className="font-medium text-brand-charcoal">
                {order.deliveryMethod === "ABUJA_PICKUP" ? "Abuja Showroom Pickup" : "Nationwide Delivery"}
              </p>
              {order.deliveryMethod === "NATIONWIDE" && (
                <p className="text-brand-charcoal mt-1">
                  {order.address}, {order.city}, {order.state}
                </p>
              )}
            </div>

            {order.additionalInstructions && (
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wider text-brand-charcoal/50">Additional Instructions</p>
                <p className="italic mt-0.5">{order.additionalInstructions}</p>
              </div>
            )}
          </div>

          {/* Items & Pricing */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold border-b border-brand-burgundy/5 pb-2">
              Order Items
            </h3>
            
            <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm font-light">
                  <div className="max-w-[70%]">
                    <p className="font-serif text-brand-burgundy leading-snug">{item.productName}</p>
                    <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mt-0.5">
                      {item.size} / {item.color} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-sans text-brand-charcoal">{formatNaira(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Pricing totals */}
            <div className="border-t border-brand-burgundy/10 pt-4 space-y-2 text-sm text-brand-charcoal/80 font-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}</span>
              </div>

              <div className="flex justify-between text-base font-semibold text-brand-burgundy border-t border-brand-burgundy/10 pt-4">
                <span>Total Amount</span>
                <span className="text-xl tracking-tight">{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Payment Trigger */}
        <div className="pt-8 border-t border-brand-burgundy/10 flex flex-col items-center space-y-4">
          <button
            onClick={handlePayment}
            className="w-full flex items-center justify-center space-x-3 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest py-4 font-medium hover:bg-brand-burgundy/90 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy shadow-sm"
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>Complete Payment Inline</span>
          </button>
          
          <p className="text-[11px] text-brand-charcoal/50 font-light max-w-md text-center leading-relaxed">
            We support secure card payments, bank transfers, and USSD directly on our site.
          </p>
        </div>
      </div>

      {/* 1. MOCK PAYMENT PORTAL MODAL */}
      {showMockModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-cream border border-brand-burgundy/20 max-w-md w-full shadow-xl overflow-hidden flex flex-col rounded-sm animate-in fade-in zoom-in-95 duration-200">
            {/* Mock Header */}
            <div className="bg-emerald-600 text-brand-cream px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-wider font-sans">paystack</span>
                <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">mock sandbox</span>
              </div>
              <button onClick={simulateCancel} className="text-brand-cream/80 hover:text-brand-cream">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mock Content */}
            <div className="p-6 space-y-6 text-brand-charcoal">
              <div className="text-center space-y-1">
                <p className="text-xs text-brand-charcoal/60 uppercase tracking-widest">Amount to Pay</p>
                <p className="text-3xl font-bold font-sans text-brand-burgundy">{formatNaira(order.total)}</p>
                <p className="text-xs text-brand-charcoal/50 font-mono mt-1">Ref: {reference}</p>
              </div>

              <div className="bg-brand-burgundy/5 p-4 rounded-sm border border-brand-burgundy/5 text-xs space-y-2 font-light leading-relaxed">
                <p className="font-semibold text-brand-burgundy uppercase tracking-wider text-[10px]">Test Checkout Simulator</p>
                <p>This simulated portal replicates the Paystack inline checkout popup during development. Choose an outcome to verify the customer checkout journey.</p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={simulateSuccess}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 text-xs uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center space-x-2 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Simulate Successful Payment</span>
                </button>

                <button
                  onClick={simulateFailure}
                  className="w-full bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream font-medium py-3 px-4 text-xs uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center space-x-2 shadow-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Simulate Failed Payment</span>
                </button>
              </div>
            </div>

            {/* Mock Footer */}
            <div className="bg-brand-charcoal/[0.02] border-t border-brand-burgundy/5 px-6 py-4 flex justify-between items-center text-[10px] text-brand-charcoal/40 font-light">
              <span>Secured by Paystack Mock</span>
              <span>{order.customerEmail}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-cream border-2 border-brand-olive max-w-xl w-full shadow-2xl overflow-hidden flex flex-col rounded-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 sm:p-10 text-center space-y-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="bg-brand-olive/15 p-4 rounded-full animate-bounce">
                  <CheckCircle className="h-14 w-14 text-brand-olive" />
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-2">
                <h2 className="font-serif text-3xl text-brand-burgundy">Payment Successful!</h2>
                <p className="font-sans text-sm text-brand-charcoal/70 font-light max-w-md mx-auto leading-relaxed">
                  Thank you for shopping with Olive & Dreams. Your order has been placed successfully and is now in progress.
                </p>
              </div>

              {/* Order Info Summary */}
              <div className="bg-brand-burgundy/5 border border-brand-burgundy/5 rounded-sm p-4 text-left text-xs space-y-2 max-w-md mx-auto font-light text-brand-charcoal/80 leading-relaxed">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-burgundy uppercase tracking-wider text-[10px]">Order Number:</span>
                  <span className="font-mono font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-burgundy uppercase tracking-wider text-[10px]">Delivery Cost:</span>
                  <span>{order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-burgundy/10 pt-2 font-medium">
                  <span className="font-semibold text-brand-burgundy uppercase tracking-wider text-[10px]">Total Paid:</span>
                  <span className="text-brand-burgundy text-sm font-bold font-sans">{formatNaira(order.total)}</span>
                </div>
                <div className="border-t border-brand-burgundy/10 pt-2">
                  <span className="font-semibold text-brand-burgundy uppercase tracking-wider text-[10px] block mb-1">Delivery Details:</span>
                  <p>{order.customerName}</p>
                  <p>{order.deliveryMethod === "ABUJA_PICKUP" ? "Abuja Showroom Pickup" : `Nationwide Delivery to ${order.address}, ${order.city}`}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  onClick={() => router.push("/shop")}
                  className="bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-8 py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors text-center shadow-sm w-full sm:w-auto"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push("/account")}
                  className="border border-brand-burgundy/20 text-brand-burgundy text-xs uppercase tracking-widest px-8 py-3.5 font-medium hover:border-brand-burgundy hover:bg-brand-burgundy/5 transition-all text-center w-full sm:w-auto"
                >
                  View Order History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FAILURE MODAL */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-cream border-2 border-brand-burgundy max-w-md w-full shadow-2xl overflow-hidden flex flex-col rounded-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              {/* Failure Icon */}
              <div className="flex justify-center">
                <div className="bg-brand-burgundy/10 p-4 rounded-full">
                  <AlertTriangle className="h-10 w-10 text-brand-burgundy" />
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-2">
                <h2 className="font-serif text-2xl text-brand-burgundy">Payment Unsuccessful</h2>
                <p className="font-sans text-xs text-brand-charcoal/70 font-light leading-relaxed">
                  We couldn&apos;t complete your checkout transaction at this time.
                </p>
                {failureError && (
                  <p className="font-sans text-xs text-brand-burgundy/80 font-medium italic mt-2">
                    ⚠️ {failureError}
                  </p>
                )}
              </div>

              {/* Recommendation */}
              <p className="text-xs text-brand-charcoal/50 font-light leading-relaxed max-w-xs mx-auto">
                No charges have been made. You can try again to complete your order, or close this window to review details.
              </p>

              {/* Actions */}
              <div className="flex flex-col space-y-3 pt-2">
                <button
                  onClick={() => {
                    setShowFailureModal(false);
                    handlePayment(); // Auto-restart payment
                  }}
                  className="w-full bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest py-3.5 font-medium hover:bg-brand-burgundy/90 transition-colors shadow-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowFailureModal(false)}
                  className="w-full border border-brand-burgundy/20 text-brand-burgundy text-xs uppercase tracking-widest py-3.5 font-medium hover:bg-brand-burgundy/5 transition-all"
                >
                  Close & Review Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
