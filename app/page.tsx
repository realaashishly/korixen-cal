'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../components/Loader';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return <Loader />;
}
