export interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  twoFactorEnabled: boolean;
  phoneNumberConfirmed: boolean;
  accessFailedCount: number;
  appUserId: string;
  // Legacy field for backward compatibility
  role?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}
