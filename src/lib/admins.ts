import type { User } from 'firebase/auth';

// List of admin emails
export const ADMIN_EMAILS: string[] = [
    'jhelenandreat@gmail.com',
    'manosunidas.iejdg@gmail.com'
];

/**
 * Checks if a given user is an administrator.
 * @param user The Firebase user object or a plain object with an email.
 * @returns True if the user is an admin, false otherwise.
 */
export function isAdminUser(user: User | { email?: string | null } | null): boolean {
    if (!user || !user.email) {
        return false;
    }
    return ADMIN_EMAILS.includes(user.email);
}
