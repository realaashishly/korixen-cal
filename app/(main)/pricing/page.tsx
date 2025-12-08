'use client';

import React from 'react';
import { differenceInDays } from 'date-fns';
import { Crown, Zap, ShieldCheck, Quote, ArrowRight, X, Gift } from 'lucide-react';
import { useApp } from '@/context/AppContext';

import { authClient } from '@/lib/auth-client';

export default function PricingPage() {
  const {
    user,
    setIsCelebrating,
    // userEmail - not needed if we have user
  } = useApp();

  const isUpgraded = user?.isUpgraded ?? false;
  const trialStartDate = user?.trialStartDate ? new Date(user.trialStartDate) : null;

  const [couponCode, setCouponCode] = React.useState("");
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRedeemCoupon = async () => {
    if (couponCode.toUpperCase() === "FAIZ25") {
      await authClient.updateUser({
        trialStartDate: new Date(),
        couponRedeemed: true
      });
      setIsCelebrating(true);
      showToast("Coupon Redeemed! 30 Days Free Trial Active.");
      setTimeout(() => setIsCelebrating(false), 5000);
    } else {
      showToast("Invalid Coupon Code");
    }
  };

  const handleBuy = async () => {
    await authClient.updateUser({
        isUpgraded: true
    });
    setIsCelebrating(true);
    showToast("Welcome to Premium!");
    setTimeout(() => setIsCelebrating(false), 5000);
  };

  const handleCancelSubscription = async () => {
    await authClient.updateUser({
        isUpgraded: false
    });
    showToast("Subscription Cancelled.");
  };

  const getDaysRemaining = () => {
    if (!trialStartDate) return 7;
    const isExtended = user?.couponRedeemed ?? false;
    const trialLength = isExtended ? 30 : 7;

    const diff = differenceInDays(new Date(), trialStartDate);
    const remaining = trialLength - diff;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <>
      {toastMsg && (
          <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
            <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold border border-white/10">
                <Check size={16} />
                {toastMsg}
            </div>
          </div>
      )}

      {/* Panel A: Control Center */}
      <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full shrink-0 animate-in slide-in-from-left-4 duration-500 fade-in">
        <div className="flex items-center justify-between px-2">
            <h2 className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-zinc-200">
              Upgrade
            </h2>
        </div>

        <div className="glass-panel p-8 rounded-[32px] shadow-sm flex-1 flex flex-col justify-center text-center">
            <div className="mb-6 w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 dark:border-zinc-800">
                <Crown size={32} className="text-black dark:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-zinc-200">Manage Subscription</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {isUpgraded ? "You have full access to all features." : "You are currently on the Free plan. Upgrade to unlock full access."}
            </p>
        </div>
      </div>

      {/* Panel B: Main Feed */}
      <div className="flex-1 flex flex-col w-full lg:h-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] shadow-depth-2 px-4 py-6 lg:px-8 lg:py-8 overflow-visible lg:overflow-hidden relative z-10 animate-in zoom-in-95 duration-500 border border-white/50 dark:border-white/5">
        <div className="flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 lg:h-full gap-8">
                {/* Left Side: Quotes & Value Prop */}
                <div className="flex flex-col justify-center h-full space-y-8 pr-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${getDaysRemaining() > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-bold uppercase text-xs tracking-widest text-gray-500 dark:text-gray-400">
                            {getDaysRemaining() > 0 ? 'Free Trial Started' : 'Trial Expired'}
                        </span>
                        </div>
                        <h1 className="text-6xl font-display font-bold text-gray-900 dark:text-zinc-100 leading-tight">
                        {isUpgraded ? (
                            <>
                                Thank you for <br/>
                                <span className="text-gray-400 dark:text-zinc-600">buying my project.</span>
                            </>
                        ) : (
                            <>
                                Clarity in <br/>
                                <span className="text-gray-400 dark:text-zinc-600">Chaos.</span>
                            </>
                        )}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-zinc-400 font-medium max-w-md leading-relaxed">
                        Korizen brings your tasks, schedule, and subscriptions into one unified flow. Achieve peace of mind through organized living.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                            <Zap size={20} className="text-black dark:text-white" />
                            </div>
                            <div>
                            <h3 className="font-bold text-black dark:text-white">Seamless Workflow</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Never miss a beat with integrated tasks and calendar.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                            <ShieldCheck size={20} className="text-black dark:text-white" />
                            </div>
                            <div>
                            <h3 className="font-bold text-black dark:text-white">Financial Control</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Track every penny with the smart subscription manager.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-[24px] border border-gray-100 dark:border-zinc-800 relative">
                        <Quote className="absolute top-4 left-4 text-gray-200 dark:text-zinc-700" size={40} />
                        <p className="relative z-10 text-sm font-medium text-gray-600 dark:text-zinc-300 italic mb-4 pt-4">
                        "Korizen creates a beautiful, good, and amazing experience, transforming chaos into clarity with elegance."
                        </p>
                    </div>
                </div>

                {/* Right Side: Pricing Card */}
                <div className="flex flex-col justify-center h-full">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                    {/* Countdown Badge - Beautifully Styled */}
                    <div className="absolute top-6 right-6 flex flex-col items-center animate-pulse">
                        <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white dark:border-black z-10">
                            <span className="text-xl font-bold leading-none">{getDaysRemaining()}</span>
                            <span className="text-[9px] uppercase font-bold tracking-wider">Days</span>
                        </div>
                    </div>

                    <div className="text-center mb-8 pt-6">
                        <div className="inline-flex items-center justify-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-full mb-4 shadow-inner">
                        <Crown size={28} className="text-black dark:text-white" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-zinc-100">
                            {isUpgraded ? "Premium Active" : "Full Access"}
                        </h2>
                        <div className="flex items-center justify-center gap-1 mt-4">
                        <span className="text-2xl font-bold text-gray-400">$</span>
                        <span className="text-7xl font-display font-bold text-black dark:text-white tracking-tighter">3</span>
                        <span className="text-gray-400 font-medium self-end mb-2">/ month</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-8 text-center border border-gray-100 dark:border-zinc-800">
                        <p className="font-bold text-gray-900 dark:text-zinc-200">
                            {isUpgraded ? "You now have full access as you were using." : "Get access to everything as you have been using."}
                        </p>
                    </div>

                    {isUpgraded ? (
                        <button 
                            onClick={handleCancelSubscription}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-bold text-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl active:scale-95 mb-6 flex items-center justify-center gap-2"
                        >
                            Cancel Subscription <X size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleBuy}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-bold text-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl active:scale-95 mb-6 flex items-center justify-center gap-2"
                        >
                            Buy Now <ArrowRight size={20} />
                        </button>
                    )}

                    {/* Coupon Section */}
                    {!isUpgraded && (
                        <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Have a coupon?</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                    type="text" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Code"
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-10 pr-3 py-3 font-bold text-sm focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 uppercase transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={handleRedeemCoupon}
                                    className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white px-4 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
