import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useLanguage } from '../LanguageContext';

export default function PayPalCheckout({ amount, mode, onSuccess, onCancel }) {
  const { lang, t } = useLanguage();
  const [error, setError] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-tarot-dark border border-tarot-gold/50 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,215,0,0.15)] relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-tarot-gold mb-2">
            {t(mode + 'ReadTitle')}
          </h3>
          <p className="text-gray-300">
            {lang === 'ko' ? `결제 금액: $${amount}` : `Amount: $${amount}`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {lang === 'ko' ? '결제 완료 후 즉시 카드를 뽑고 상담을 시작합니다.' : 'Draw cards and start reading immediately after payment.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="w-full relative z-10">
          <PayPalButtons
            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: `Arcana Insight - ${mode.toUpperCase()} Reading`,
                    amount: {
                      value: amount.toString(),
                      currency_code: 'USD'
                    },
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              try {
                const details = await actions.order.capture();
                console.log('Payment Successful:', details);
                onSuccess(details);
              } catch (err) {
                console.error('Payment Capture Error:', err);
                setError(lang === 'ko' ? '결제 승인 중 오류가 발생했습니다.' : 'An error occurred during payment capture.');
              }
            }}
            onError={(err) => {
              console.error('PayPal Checkout Error:', err);
              setError(lang === 'ko' ? '결제 시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' : 'Payment system error. Please try again.');
            }}
            onCancel={() => {
              setError(lang === 'ko' ? '결제가 취소되었습니다.' : 'Payment was cancelled.');
            }}
          />
        </div>
      </div>
    </div>
  );
}
