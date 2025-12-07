'use client';

import React, { useState } from 'react';
import Logo from '../../components/Logo';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await authClient.signUp.email({
        email,
        password,
        name,
    }, {
        onSuccess: () => {
            router.push('/onboarding');
        },
        onError: (ctx) => {
            setError(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  const handleGoogleSignIn = async () => {
      await authClient.signIn.social({
          provider: "google",
          callbackURL: "/",
          newUserCallbackURL: "/onboarding",
      })
  }

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-zinc-950 bg-dot-pattern items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
         <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><Logo /></div>
            <h1 className="font-display font-bold text-3xl mb-2 text-black dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Join Korizen workspace today</p>
         </div>
         
         <button 
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors mb-6 group"
         >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">Continue with Google</span>
         </button>

         <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-zinc-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-900 px-2 text-gray-400 font-bold tracking-wider">Or continue with email</span></div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
               <input 
                 type="text" 
                 required
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                 placeholder="John Doe"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                 placeholder="name@work-email.com"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
               <input 
                 type="password" 
                 required
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                 placeholder="••••••••"
               />
            </div>
            
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

            <button 
               type="submit"
               disabled={isLoading}
               className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl mt-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
               {isLoading ? 'Create Account' : 'Sign Up'}
            </button>
         </form>
         
         <p className="text-center mt-6 text-xs text-gray-400">
           Already have an account? <Link href="/signin" className="text-black dark:text-white font-bold cursor-pointer hover:underline">Sign in</Link>
         </p>
      </div>
    </div>
  );
};

export default SignupPage;
