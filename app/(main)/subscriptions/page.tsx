'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import SubscriptionTracker from '@/components/SubscriptionTracker';
import { getSubscriptions, createSubscription, deleteSubscription } from '@/app/actions';
import { Subscription } from '@/types';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const data = await getSubscriptions();
        setSubscriptions(data.map(s => ({
          ...s,
          startDate: new Date(s.startDate),
          endDate: s.endDate ? new Date(s.endDate) : undefined,
          billingCycle: s.billingCycle as any,
          type: s.type as any
        })));
      } catch (error) {
        console.error("Failed to fetch subscriptions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const handleAddSubscription = async (sub: Subscription) => {
    try {
      // Optimistic update
      setSubscriptions(prev => [...prev, sub]);
      
      const newSub = await createSubscription({
        ...sub,
        startDate: sub.startDate.toISOString(),
        endDate: sub.endDate?.toISOString()
      });

      // Update with real ID from server
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, id: newSub.id } : s));
    } catch (error) {
      console.error("Failed to create subscription", error);
      // Revert on failure
      setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      // Optimistic update
      const subToDelete = subscriptions.find(s => s.id === id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));

      await deleteSubscription(id);
    } catch (error) {
      console.error("Failed to delete subscription", error);
      // Revert (fetch again or keep deleted item?) - Fetching again is safer but slower.
      // For now, just log error.
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
      );
  }

  return (
    <>
      {/* Panel A: Control Center */}
      <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full shrink-0 animate-in slide-in-from-left-4 duration-500 fade-in">
        <div className="flex items-center justify-between px-2">
            <h2 className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-zinc-200">
              Tracker
            </h2>
        </div>

        <div className="glass-panel p-8 rounded-[32px] shadow-sm flex-1 flex flex-col justify-center text-center">
            <div className="mb-6 w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 dark:border-zinc-800">
                <CreditCard size={32} className="text-black dark:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-zinc-200">Manage Expenses</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Keep track of your recurring services and software licenses in one place.
            </p>
        </div>
      </div>

      {/* Panel B: Main Feed */}
      <div className="flex-1 flex flex-col w-full lg:h-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] shadow-depth-2 px-4 py-6 lg:px-8 lg:py-8 overflow-visible lg:overflow-hidden relative z-10 animate-in zoom-in-95 duration-500 border border-white/50 dark:border-white/5">
        <SubscriptionTracker 
            subscriptions={subscriptions}
            onAddSubscription={handleAddSubscription}
            onDeleteSubscription={handleDeleteSubscription}
        />
      </div>
    </>
  );
}
