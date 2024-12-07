// core/frontend/src/routes/types.ts

import { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  public?: boolean;
  exact?: boolean;
  roles?: string[];
  children?: RouteConfig[];
}
