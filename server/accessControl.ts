import { TRPCError } from "@trpc/server";

export enum SubscriptionTier {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface FeatureAccess {
  maxProjects: number;
  maxCollaborators: number;
  canExport: boolean;
  canDownload: boolean;
  canUseAdvancedFeatures: boolean;
  canAccessAdmin: boolean;
  apiCallsPerMonth: number;
}

export const tierFeatures: Record<SubscriptionTier, FeatureAccess> = {
  [SubscriptionTier.FREE]: {
    maxProjects: 3,
    maxCollaborators: 1,
    canExport: false,
    canDownload: false,
    canUseAdvancedFeatures: false,
    canAccessAdmin: false,
    apiCallsPerMonth: 100,
  },
  [SubscriptionTier.PRO]: {
    maxProjects: 50,
    maxCollaborators: 10,
    canExport: true,
    canDownload: true,
    canUseAdvancedFeatures: true,
    canAccessAdmin: false,
    apiCallsPerMonth: 5000,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxProjects: 500,
    maxCollaborators: 100,
    canExport: true,
    canDownload: true,
    canUseAdvancedFeatures: true,
    canAccessAdmin: true,
    apiCallsPerMonth: 50000,
  },
};

export class AccessControlManager {
  /**
   * Check if user has permission for a feature
   */
  static checkFeatureAccess(
    tier: SubscriptionTier,
    feature: keyof FeatureAccess
  ): boolean {
    const features = tierFeatures[tier];
    const value = features[feature];
    
    if (typeof value === "boolean") {
      return value;
    }
    
    return false;
  }

  /**
   * Verify user role
   */
  static verifyRole(userRole: UserRole, requiredRole: UserRole): boolean {
    if (requiredRole === UserRole.ADMIN) {
      return userRole === UserRole.ADMIN;
    }
    return true;
  }

  /**
   * Check project limit
   */
  static checkProjectLimit(
    tier: SubscriptionTier,
    currentProjectCount: number
  ): boolean {
    const features = tierFeatures[tier];
    return currentProjectCount < features.maxProjects;
  }

  /**
   * Check collaborator limit
   */
  static checkCollaboratorLimit(
    tier: SubscriptionTier,
    currentCollaboratorCount: number
  ): boolean {
    const features = tierFeatures[tier];
    return currentCollaboratorCount < features.maxCollaborators;
  }

  /**
   * Check API call limit
   */
  static checkAPICallLimit(
    tier: SubscriptionTier,
    currentCallsThisMonth: number
  ): boolean {
    const features = tierFeatures[tier];
    return currentCallsThisMonth < features.apiCallsPerMonth;
  }

  /**
   * Get feature access for tier
   */
  static getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
    return tierFeatures[tier];
  }
}

/**
 * Middleware for tRPC to check access control
 */
export function createAccessControlMiddleware(
  tier: SubscriptionTier,
  userRole: UserRole
) {
  return {
    checkFeature: (feature: keyof FeatureAccess) => {
      if (!AccessControlManager.checkFeatureAccess(tier, feature)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Feature "${feature}" is not available in your subscription tier`,
        });
      }
    },

    checkRole: (requiredRole: UserRole) => {
      if (!AccessControlManager.verifyRole(userRole, requiredRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }
    },

    checkProjectLimit: (currentCount: number) => {
      if (!AccessControlManager.checkProjectLimit(tier, currentCount)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You have reached the maximum number of projects (${tierFeatures[tier].maxProjects}) for your subscription tier`,
        });
      }
    },

    checkCollaboratorLimit: (currentCount: number) => {
      if (!AccessControlManager.checkCollaboratorLimit(tier, currentCount)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You have reached the maximum number of collaborators (${tierFeatures[tier].maxCollaborators}) for your subscription tier`,
        });
      }
    },

    checkAPICallLimit: (currentCalls: number) => {
      if (!AccessControlManager.checkAPICallLimit(tier, currentCalls)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You have reached your API call limit (${tierFeatures[tier].apiCallsPerMonth}) for this month`,
        });
      }
    },
  };
}
