export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
  tenant: {
    companyInfo: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logoUrl: string;
      doctorName?: string;
    };
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponse['user'] | null;
  tenant: LoginResponse['tenant'] | null;
  token: string | null;
}
