export type AuthTab = 'login' | 'signup';
export type AccountType = 'user' | 'farmer' | 'agri-business';

export interface UserAccount {
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
  accountType?: AccountType;
  phone?: string;
  birthDate?: string;
  // Farmer specific
  state?: string;
  district?: string;
  village?: string;
  farmSize?: string;
  crops?: string[];
  // Agri Tools specific
  businessName?: string;
  businessAddress?: string;
  productCategories?: string[];
}
