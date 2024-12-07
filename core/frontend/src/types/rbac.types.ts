// core/frontend/src/types/rbac.types.ts

export interface Role {
  id: string;
  name: string;
  description: string;
  parentRole?: string;
  level: number;
  permissions: string[];
  inheritsFrom?: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  dependencies: string[];
  implies: string[];
}

export interface RoleHierarchy {
  id: string;
  parentId?: string;
  children: RoleHierarchy[];
  role: Role;
  level: number;
}
