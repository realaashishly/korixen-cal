"use client";

import React, { useState } from "react";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { UserRole } from "../../types";
import { DEFAULT_USER_ROLES } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const OnboardingPage: React.FC = () => {
  const { setAppState } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnboardingComplete = async () => {
    if (!role || !name || !location) return;

    setIsSubmitting(true);
    setAppState("building");

    try {
      const { error } = await authClient.updateUser({
        name: name,
        role: role,
        location: location,
        isOnboardingComplete: true,
        trialStartDate: new Date(),
      });

      if (error) {
        console.error("Onboarding failed:", error);
        setIsSubmitting(false);
        setAppState("onboarding");
        return;
      }
      setAppState("app");
      router.replace("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      setIsSubmitting(false);
      setAppState("onboarding");
    }
  };

  const handleNext = () => {
    if (step === 1 && role) setStep(2);
    else if (step === 2 && name) setStep(3);
    else if (step === 3 && location) {
      handleOnboardingComplete();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-zinc-950 bg-dot-pattern items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 1 && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
            <h2 className="text-4xl font-display font-bold text-center mb-8 text-black dark:text-white">
              What describes you best?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {DEFAULT_USER_ROLES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRole(item.id as UserRole)}
                  className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 group ${
                    role === item.id
                      ? "border-black bg-black text-white dark:bg-white dark:text-black dark:border-white scale-105 shadow-xl"
                      : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <item.icon
                    size={32}
                    className={role === item.id ? "animate-bounce" : ""}
                  />
                  <span className="font-bold text-lg">{item.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!role}
                className="bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-all"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 text-center">
            <h2 className="text-4xl font-display font-bold mb-2 text-black dark:text-white">
              What's your name?
            </h2>
            <p className="text-gray-400 mb-8">
              We'll customize your workspace.
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Faiz"
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-zinc-700 text-center text-5xl font-bold py-4 focus:outline-none focus:border-black dark:focus:border-white transition-all mb-8 text-black dark:text-white placeholder:text-gray-200 dark:placeholder:text-zinc-800"
              onKeyDown={(e) => e.key === "Enter" && name && handleNext()}
            />

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 font-bold hover:text-black dark:hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!name}
                className="bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-all"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 text-center">
            <h2 className="text-4xl font-display font-bold mb-2 text-black dark:text-white">
              Where are you based?
            </h2>
            <p className="text-gray-400 mb-8">
              To set up your local time and weather.
            </p>

            <div className="relative max-w-xs mx-auto mb-8">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoFocus
                placeholder="City Name"
                disabled={isSubmitting}
                className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 font-bold text-xl focus:outline-none focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                onKeyDown={(e) =>
                  e.key === "Enter" && location && !isSubmitting && handleNext()
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="text-gray-400 font-bold hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!location || isSubmitting}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-xl flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Finish Setup"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
