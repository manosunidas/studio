import type { User } from 'firebase/auth';

/**
 * @fileoverview Admin user management.
 * This file centralizes the logic for identifying administrator accounts.
 * By keeping the list of admin emails here, we can easily update it in one place
 * without modifying authentication logic scattered across the application.
 */


// Centralized list of admin email addresses.
export const ADMIN_EMAILS: string[] = [
    'jhelenandreat@gmail.com',
    'manosunidas.iejdg@gmail.com'
];

/**
 * Checks if a given user is an administrator by comparing their email
 * against a predefined list.
 * @param user The Firebase user object or any object with an `email` property. Can be null.
 * @returns {boolean} True if the user's email is in the admin list, false otherwise.
 */
export function isAdminUser(user: User | { email?: string | null } | null): boolean {
    // A user cannot be an admin if they don't exist or don't have an email.
    if (!user || !user.email) {
        return false;
    }
    return ADMIN_EMAILS.includes(user.email);
}
