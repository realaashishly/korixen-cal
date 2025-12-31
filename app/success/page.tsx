'use client';

import React, { Suspense } from 'react';
import { CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { verifyPurchase } from '../actions';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');
  
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = React.useState("Verifying your purchase...");

  React.useEffect(() => {
    if (checkoutId) {
        verifyPurchase(checkoutId)
            .then((res) => {
                if (res.success) {
                    setStatus('success');
                    setMsg("Your subscription is now active! You have full access.");
                } else {
                    setStatus('error');
                    setMsg(res.error || "Could not verify purchase.");
                }
            })
            .catch(() => {
                setStatus('error');
                setMsg("Something went wrong verifying the purchase.");
            });
    } else {
        // Fallback if accessed directly without ID (optional)
        setStatus('success'); 
        setMsg("Welcome! If you just purchased, your account should be updated shortly.");
    }
  }, [checkoutId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-8 md:p-12 shadow-2xl max-w-md w-full text-center animate-in zoom-in-95 duration-500 fade-in">
        
        {status === 'loading' && (
             <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="text-blue-600 dark:text-blue-400 w-10 h-10 animate-spin" />
            </div>
        )}
        
        {status === 'success' && (
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="text-green-600 dark:text-green-400 w-10 h-10" />
            </div>
        )}

        {status === 'error' && (
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <XCircle className="text-red-600 dark:text-red-400 w-10 h-10" />
            </div>
        )}
        
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-zinc-100 mb-4">
          {status === 'loading' ? 'Verifying...' : (status === 'success' ? 'Payment Successful!' : 'Verification Failed')}
        </h1>
        
        <p className="text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
          {msg}
        </p>

        {checkoutId && (
            <div className='mb-6 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 text-xs text-gray-400 font-mono'>
                Ref: {checkoutId}
            </div>
        )}

        <Link 
          href="/dashboard" 
          className={`w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${status === 'loading' ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Go to Dashboard <ArrowRight size={20} />
        </Link>
      </div>
      
      <p className="mt-8 text-gray-400 text-sm">
        Questions? Contact support@korizen.com
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
        </div>
    }>
        <SuccessContent />
    </Suspense>
  );
}
