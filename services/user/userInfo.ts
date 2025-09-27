// // services/storage/userStorage.ts
// import { User } from '../auth/types';

// // Storage keys
// const STORAGE_KEYS = {
//   USER: 'user_data',
//   TOKEN: 'auth_token',
//   REFRESH_TOKEN: 'refresh_token',
// } as const;

// // User state management class
// export class UserStorage {
//   // Save user data to localStorage
//   static saveUser(user: User): void {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
//     }
//   }

//   // Get user data from localStorage
//   static getUser(): User | null {
//     if (typeof window !== 'undefined') {
//       const userData = localStorage.getItem(STORAGE_KEYS.USER);
//       return userData ? JSON.parse(userData) : null;
//     }
//     return null;
//   }

//   // Remove user data from localStorage
//   static removeUser(): void {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem(STORAGE_KEYS.USER);
//       localStorage.removeItem(STORAGE_KEYS.TOKEN);
//       localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
//     }
//   }

//   // Update user data
//   static updateUser(updates: Partial<User>): void {
//     const currentUser = this.getUser();
//     if (currentUser) {
//       const updatedUser = { ...currentUser, ...updates };
//       this.saveUser(updatedUser);
//     }
//   }

//   // Check if user is logged in
//   static isLoggedIn(): boolean {
//     return this.getUser() !== null;
//   }

//   // Save auth token
//   static saveToken(token: string): void {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(STORAGE_KEYS.TOKEN, token);
//     }
//   }

//   // Get auth token
//   static getToken(): string | null {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem(STORAGE_KEYS.TOKEN);
//     }
//     return null;
//   }

//   // Save refresh token
//   static saveRefreshToken(token: string): void {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
//     }
//   }

//   // Get refresh token
//   static getRefreshToken(): string | null {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
//     }
//     return null;
//   }

//   // Clear all auth-related data
//   static clearAuthData(): void {
//     this.removeUser();
//   }

//   // Check if user email is verified
//   static isEmailVerified(): boolean {
//     const user = this.getUser();
//     return user?.isVerified || false;
//   }

//   // Get user role
//   static getUserRole(): string | null {
//     const user = this.getUser();
//     return user?.role || null;
//   }

//   // Get user's full name
//   static getUserFullName(): string | null {
//     const user = this.getUser();
//     if (user?.firstName && user?.lastName) {
//       return `${user.firstName} ${user.lastName}`;
//     }
//     return null;
//   }

//   // Check if tokens exist
//   static hasValidTokens(): boolean {
//     return !!(this.getToken() && this.getRefreshToken());
//   }

//   // Save complete auth data (user + tokens)
//   static saveAuthData(user: User, token?: string, refreshToken?: string): void {
//     this.saveUser(user);
//     if (token) this.saveToken(token);
//     if (refreshToken) this.saveRefreshToken(refreshToken);
//   }
// }

// // Utility functions for easier usage
// export const getCurrentUser = (): User | null => {
//   return UserStorage.getUser();
// };

// export const updateCurrentUser = (updates: Partial<User>): void => {
//   UserStorage.updateUser(updates);
// };

// export const logout = (): void => {
//   UserStorage.clearAuthData();
// };

// export const isUserLoggedIn = (): boolean => {
//   return UserStorage.isLoggedIn();
// };

// export const getAuthToken = (): string | null => {
//   return UserStorage.getToken();
// };

// export const getRefreshToken = (): string | null => {
//   return UserStorage.getRefreshToken();
// };

// export const isEmailVerified = (): boolean => {
//   return UserStorage.isEmailVerified();
// };

// export const getUserRole = (): string | null => {
//   return UserStorage.getUserRole();
// };

// export const getUserFullName = (): string | null => {
//   return UserStorage.getUserFullName();
// };

// export const hasValidTokens = (): boolean => {
//   return UserStorage.hasValidTokens();
// };

// export const saveAuthData = (user: User, token?: string, refreshToken?: string): void => {
//   UserStorage.saveAuthData(user, token, refreshToken);
// };

// // Default export
// export default {
//   UserStorage,
//   getCurrentUser,
//   updateCurrentUser,
//   logout,
//   isUserLoggedIn,
//   getAuthToken,
//   getRefreshToken,
//   isEmailVerified,
//   getUserRole,
//   getUserFullName,
//   hasValidTokens,
//   saveAuthData,
// };