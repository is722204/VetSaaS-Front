export interface CompanyInfo {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'vet' | 'assistant';
  createdAt: string;
  lastLogin: string;
}

export interface Tenant {
  companyInfo: CompanyInfo;
  users: { [userId: string]: User };
}
