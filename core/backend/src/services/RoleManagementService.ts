// core/backend/src/services/RoleManagementService.ts

import { prisma } from '../prisma';
import { Role, Permission, User } from '@prisma/client';
import { RoleError } from '../errors/RoleError';

export class RoleManagementService {
  // Role CRUD Operations
  public async createRole(data: {
    name: string;
    description: string;
    permissions: string[];
    parentRoleId?: string;
  }) {
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      throw new RoleError('Role already exists');
    }

    return prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        parentRoleId: data.parentRoleId,
        permissions: {
          connect: data.permissions.map(id => ({ id }))
        }
      },
      include: {
        permissions: true,
        parentRole: true,
        childRoles: true
      }
    });
  }

  public async updateRole(roleId: string, data: {
    name?: string;
    description?: string;
    permissions?: string[];
    parentRoleId?: string | null;
  }) {
    if (data.name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          name: data.name,
          NOT: { id: roleId }
        }
      });

      if (existingRole) {
        throw new RoleError('Role name already exists');
      }
    }

    return prisma.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        parentRoleId: data.parentRoleId,
        permissions: data.permissions ? {
          set: data.permissions.map(id => ({ id }))
        } : undefined
      },
      include: {
        permissions: true,
        parentRole: true,
        childRoles: true
      }
    });
  }

  // Role Hierarchy Management
  public async getRoleHierarchy(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
        parentRole: {
          include: {
            permissions: true
          }
        },
        childRoles: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!role) {
      throw new RoleError('Role not found');
    }

    return {
      ...role,
      inheritedPermissions: this.getInheritedPermissions(role)
    };
  }

  private getInheritedPermissions(role: Role & {
    permissions: Permission[];
    parentRole?: Role & { permissions: Permission[] } | null;
  }): Permission[] {
    const inheritedPermissions = [...role.permissions];
    
    if (role.parentRole) {
      inheritedPermissions.push(...this.getInheritedPermissions(role.parentRole));
    }

    return Array.from(new Set(inheritedPermissions));
  }

  // Role Assignment and Validation
  public async assignRoleToUser(userId: string, roleId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true
      }
    });

    if (!user) {
      throw new RoleError('User not found');
    }

    // Check for role conflicts
    const newRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        conflictingRoles: true
      }
    });

    if (!newRole) {
      throw new RoleError('Role not found');
    }

    const hasConflict = user.roles.some(existingRole =>
      newRole.conflictingRoles.some(conflict => conflict.id === existingRole.id)
    );

    if (hasConflict) {
      throw new RoleError('Role assignment would create a conflict');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId }
        }
      },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  // Role Analytics and Reporting
  public async getRoleAnalytics(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
        permissions: true,
        childRoles: true
      }
    });

    if (!role) {
      throw new RoleError('Role not found');
    }

    return {
      userCount: role.users.length,
      permissionCount: role.permissions.length,
      childRolesCount: role.childRoles.length,
      // Add more analytics as needed
    };
  }
}

export const roleManagementService = new RoleManagementService();
