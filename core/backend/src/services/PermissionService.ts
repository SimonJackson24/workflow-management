// core/backend/src/services/PermissionService.ts

import { prisma } from '../prisma';
import { Permission, Role, User } from '@prisma/client';
import { PermissionError } from '../errors/PermissionError';

export class PermissionService {
  // Permission CRUD Operations
  public async createPermission(data: {
    name: string;
    description: string;
    category: string;
    dependencies?: string[];
    implies?: string[];
  }) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: data.name }
    });

    if (existingPermission) {
      throw new PermissionError('Permission already exists');
    }

    return prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        dependencies: data.dependencies,
        implies: data.implies
      }
    });
  }

  // Permission Validation and Checking
  public async validateUserPermission(userId: string, requiredPermission: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
            parentRole: {
              include: {
                permissions: true
              }
            }
          }
        },
        directPermissions: true
      }
    });

    if (!user) {
      throw new PermissionError('User not found');
    }

    const allPermissions = this.getAllUserPermissions(user);
    return allPermissions.some(permission => permission.name === requiredPermission);
  }

  public async validateUserPermissions(userId: string, requiredPermissions: string[]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
            parentRole: {
              include: {
                permissions: true
              }
            }
          }
        },
        directPermissions: true
      }
    });

    if (!user) {
      throw new PermissionError('User not found');
    }

    const allPermissions = this.getAllUserPermissions(user);
    const permissionNames = allPermissions.map(p => p.name);

    return {
      hasAllPermissions: requiredPermissions.every(p => permissionNames.includes(p)),
      hasAnyPermission: requiredPermissions.some(p => permissionNames.includes(p)),
      missingPermissions: requiredPermissions.filter(p => !permissionNames.includes(p))
    };
  }

  // Permission Inheritance and Resolution
  private getAllUserPermissions(user: User & {
    roles: (Role & {
      permissions: Permission[];
      parentRole?: Role & { permissions: Permission[] } | null;
    })[];
    directPermissions: Permission[];
  }): Permission[] {
    const permissions = new Set<Permission>();

    // Add direct permissions
    user.directPermissions.forEach(p => permissions.add(p));

    // Add role permissions including inherited ones
    user.roles.forEach(role => {
      role.permissions.forEach(p => permissions.add(p));
      if (role.parentRole) {
        role.parentRole.permissions.forEach(p => permissions.add(p));
      }
    });

    return Array.from(permissions);
  }

  // Permission Group Management
  public async createPermissionGroup(data: {
    name: string;
    description: string;
    permissions: string[];
  }) {
    return prisma.permissionGroup.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissions.map(id => ({ id }))
        }
      },
      include: {
        permissions: true
      }
    });
  }

  // Temporary Permission Management
  public async grantTemporaryPermission(data: {
    userId: string;
    permissionId: string;
    expiresAt: Date;
    reason?: string;
  }) {
    return prisma.temporaryPermission.create({
      data: {
        userId: data.userId,
        permissionId: data.permissionId,
        expiresAt: data.expiresAt,
        reason: data.reason
      }
    });
  }

  // Permission Analytics
  public async getPermissionAnalytics(permissionId: string) {
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        roles: {
          include: {
            users: true
          }
        }
      }
    });

    if (!permission) {
      throw new PermissionError('Permission not found');
    }

    const userCount = new Set(
      permission.roles.flatMap(role => role.users.map(user => user.id))
    ).size;

    return {
      roleCount: permission.roles.length,
      userCount,
      // Add more analytics as needed
    };
  }
}

export const permissionService = new PermissionService();
