// core/backend/src/types/email.types.ts

export interface EmailTemplate {
  name: string;
  subject: string;
  path: string;
}

export interface EmailOptions {
  template: string;
  to: string;
  data: Record<string, any>;
  text?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}
