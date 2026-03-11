"use client";

import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';

interface PaystackCheckoutProps {
  amount: number; // in NGN (will be multiplied by 100 for kobo)
  email: string;
  phone: string;
  location: string;
  deliveryDate: string;
  items?: any[];
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

export default function PaystackCheckout({
  amount,
  email,
  phone,
  location,
  deliveryDate,
  items,
  onSuccess,
  onClose,
}: PaystackCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: amount * 100, // Paystack amount is in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      custom_fields: [
        {
          display_name: 'Phone Number',
          variable_name: 'phone',
          value: phone,
        },
        {
          display_name: 'Location',
          variable_name: 'location',
          value: location,
        },
        {
          display_name: 'Delivery Date',
          variable_name: 'delivery_date',
          value: deliveryDate,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      // Call backend to verify and save payment
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.reference,
          email,
          phone,
          amount,
          location,
          deliveryDate,
          items, // Pass items to Backend
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (onSuccess) onSuccess(reference.reference);
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('An error occurred during verification.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    if (onClose) onClose();
  };

  const startPayment = () => {
    if (!email || !phone || !location || !deliveryDate || amount <= 0) {
      alert('Please fill all required fields before proceeding to payment.');
      return;
    }
    initializePayment({ onSuccess: handlePaymentSuccess, onClose: handlePaymentClose });
  };

  return (
    <button
      onClick={startPayment}
      disabled={isProcessing}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full flex justify-center items-center disabled:opacity-50 transition-colors"
    >
      {isProcessing ? 'Verifying Payment...' : `Pay NGN ${amount.toLocaleString()}`}
    </button>
  );
}
