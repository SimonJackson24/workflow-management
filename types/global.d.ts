// types/global.d.ts

// Global type augmentations
declare global {
  interface Window {
    // Add custom window properties
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
    Stripe?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }

  // Custom event types
  interface CustomEventMap {
    'app:loaded': CustomEvent<void>;
    'auth:login': CustomEvent<{ userId: string }>;
    'auth:logout': CustomEvent<void>;
    'error:global': CustomEvent<{ message: string; code?: string }>;
  }

  // Extend WindowEventMap
  interface WindowEventMap extends CustomEventMap {}

  // Custom namespace
  namespace App {
    interface User {
      id: string;
      email: string;
      name: string;
      role: string;
    }

    interface Config {
      apiUrl: string;
      environment: string;
      version: string;
    }

    interface Theme {
      mode: 'light' | 'dark';
      primary: string;
      secondary: string;
    }
  }

  // Utility types
  type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
  };

  type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
      ? RecursivePartial<U>[]
      : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
  };
}

// Module declarations
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Export empty object to make it a module
export {};
