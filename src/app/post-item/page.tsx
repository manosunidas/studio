
'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { isAdminUser } from '@/lib/admins';

/**
 * @fileoverview PostItemPage component.
 * This is a legacy page that now serves only as a redirector.
 * The functionality for posting items has been moved into the admin profile page (`/profile`).
 * This component ensures that any old bookmarks or links to `/post-item` correctly
 * redirect users to the appropriate page based on their admin status.
 */
export default function PostItemPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // After user status is loaded, perform redirection.
    if (!isUserLoading) {
      if (user && isAdminUser(user)) {
        // If the user is an admin, redirect them to the profile page (admin panel).
        router.replace('/profile');
      } else {
        // If the user is not an admin, redirect them to the homepage.
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while checking user authentication.
  return <div className="container text-center py-20">Cargando...</div>;
}
