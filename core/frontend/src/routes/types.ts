// core/frontend/src/routes/types.ts

import { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  public?: boolean;
  roles?: string[];
  exact?: boolean;
  children?: RouteConfig[];
}
