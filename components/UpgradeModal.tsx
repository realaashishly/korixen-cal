
import React, { useState } from 'react';
import { X, Crown, ArrowRight, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose,
  message = "You've reached the limit of your Free plan. Upgrade to unlock full access."
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      await authClient.checkout({
        slug: "pro-access",
      });
    } catch (error) {
      console.error("Purchase error:", error);
      // Fallback to pricing page if checkout fails or to show more info
      router.push('/pricing');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-zinc-800 flex flex-col m-4">
        
        {/* Header Image / Icon */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 p-8 flex justify-center items-center border-b border-gray-100 dark:border-zinc-800 dashed">
            <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/10">
                <Crown size={40} className="text-white dark:text-black" strokeWidth={1.5} />
            </div>
        </div>

        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors z-20"
        >
            <X size={20} className="text-gray-900 dark:text-white" />
        </button>

        <div className="p-8 flex-1 text-center">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                Unlock Pro Access
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {message}
            </p>

            <div className="space-y-3 mb-8 text-left bg-gray-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                        <Check size={12} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Unlimited subscriptions</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                        <Check size={12} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Unlimited calendar events</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                        <Check size={12} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Priority support</span>
                </div>
            </div>

            <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-[20px] font-bold text-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Processing..." : <>Upgrade for $3/mo <ArrowRight size={18} /></>}
            </button>
            
            <button 
                onClick={onClose}
                className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-wider"
            >
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
