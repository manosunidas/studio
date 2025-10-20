
'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function PostItemPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const isAdmin = user?.email === 'jhelenandreat@gmail.com';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !isAdmin) {
        // If not loading, and user is not an admin (or not logged in), redirect to home
        router.replace('/');
      } else {
         // If user is admin, redirect to the admin panel which has the posting functionality
        router.replace('/admin');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  // Render a loading state while checking user auth
  return <div className="container text-center py-20">Cargando...</div>;
}
