// Admin configuration
export const ADMIN_EMAIL = 'peppendriver@gmail.com';

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
