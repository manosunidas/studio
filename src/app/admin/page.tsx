'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { isAdminUser } from '@/lib/admins';

/**
 * @fileoverview AdminPage component.
 * This page serves as a protected redirector for administrators.
 * It checks the user's authentication status and role. If the user is an admin,
 * it redirects them to their profile page (`/profile`), which acts as the admin dashboard.
 * If the user is not an admin or not logged in, it redirects them to the homepage (`/`).
 * This prevents non-admin users from accessing any route under `/admin`.
 */

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // This effect runs when the user's authentication state is determined.
    // It should not run while the user object is still loading.
    if (!isUserLoading) {
      if (user && isAdminUser(user)) {
        // If the user is authenticated and is an admin, redirect to the profile (admin panel).
        router.replace('/profile');
      } else {
        // Otherwise, redirect to the homepage.
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while checking user authentication and role.
  // This provides feedback to the user and prevents a flash of unstyled or incorrect content.
  return <div className="container text-center py-20">Cargando...</div>;
}
