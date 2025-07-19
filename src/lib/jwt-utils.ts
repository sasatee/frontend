import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  email: string;
  name: string[];
  nameid: string;
  aud: string;
  iss: string;
  role: string[];
  nbf: number;
  exp: number;
  iat: number;
}

export interface DecodedUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  exp: number;
  iat: number;
}

/**
 * Decode JWT token and extract user information
 * @param token JWT token string
 * @returns Decoded user information
 */
export const decodeJwtToken = (token: string): DecodedUserInfo | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id: decoded.nameid,
      email: decoded.email,
      firstName: decoded.name[0] || '',
      lastName: decoded.name[1] || '',
      roles: Array.isArray(decoded.role) ? decoded.role : [decoded.role],
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if user has required roles
 * @param userRoles Array of user's roles
 * @param requiredRoles Array of required roles
 * @param requireAll Whether user must have ALL roles (true) or ANY role (false)
 * @returns Boolean indicating if user has required roles
 */
export const hasRequiredRoles = (
  userRoles: string[],
  requiredRoles: string[],
  requireAll: boolean = false
): boolean => {
  if (!userRoles || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }

  // Normalize roles to uppercase for comparison
  const normalizedUserRoles = userRoles.map((role) => role.toUpperCase());
  const normalizedRequiredRoles = requiredRoles.map((role) => role.toUpperCase());

  if (requireAll) {
    // User must have ALL required roles
    return normalizedRequiredRoles.every((role) => normalizedUserRoles.includes(role));
  } else {
    // User must have ANY of the required roles
    return normalizedRequiredRoles.some((role) => normalizedUserRoles.includes(role));
  }
};

/**
 * Check if token is expired
 * @param token JWT token string
 * @returns Boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    // If token can't be decoded, consider it expired
    return true;
  }
};

/**
 * Get user roles from token
 * @param token JWT token string
 * @returns Array of user roles or empty array if token is invalid
 */
export const getUserRolesFromToken = (token: string): string[] => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return Array.isArray(decoded.role) ? decoded.role : [decoded.role];
  } catch (error) {
    console.error('Error extracting roles from token:', error);
    return [];
  }
};

/**
 * Check if user has admin role
 * @param userRoles Array of user's roles
 * @returns Boolean indicating if user is admin
 */
export const isAdmin = (userRoles: string[]): boolean => {
  return hasRequiredRoles(userRoles, ['ADMIN']);
};

/**
 * Check if user has employee role
 * @param userRoles Array of user's roles
 * @returns Boolean indicating if user is employee
 */
export const isEmployee = (userRoles: string[]): boolean => {
  return hasRequiredRoles(userRoles, ['EMPLOYEE']);
};

/**
 * Get user ID from token
 * @param token JWT token string
 * @returns User ID or null if token is invalid
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.nameid;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};
