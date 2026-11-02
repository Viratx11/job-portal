export type UserRole = 'ROLE_ADMIN' | 'ROLE_JOB_SEEKER' | 'ROLE_EMPLOYER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: UserRole;
  userStatus: UserStatus;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  jwt: string;
  title: string;
  message: string;
  user: UserResponse;
}