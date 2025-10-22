'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { isAdminUser } from '@/lib/admins';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // This page is now just a redirector.
    // If the user is the admin, send them to their profile which is the new admin panel.
    // If not, send them to the homepage.
    if (!isUserLoading) {
      if (user && isAdminUser(user)) {
        router.replace('/profile');
      } else {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while checking user auth
  return <div className="container text-center py-20">Cargando...</div>;
}
