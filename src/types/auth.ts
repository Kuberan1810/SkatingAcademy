export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  role?: string;
  avatar?: string | null;
  created_at?: string;
}

export interface ApiValidationErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
  input?: any;
  ctx?: Record<string, any>;
}

export interface ApiValidationError {
  detail?: string | ApiValidationErrorDetail[];
  message?: string;
}
