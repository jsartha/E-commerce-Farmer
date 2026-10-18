import { UserAccount } from '../types/auth';
import { MarketplaceTransaction, Product } from '../types/dashboard';
import { LEGACY_DEMO_ACCOUNT_EMAILS, LEGACY_DEMO_PRODUCT_IDS } from '../data/legacyDemoIds';

const TOKEN_KEY = 'farmer-marketplace-session-email';
const SESSION_USER_KEY = 'farmer-marketplace-session-user';
const ACCOUNTS_KEY = 'farmer-marketplace-accounts';
const DATA_KEY_PREFIX = 'farmer-marketplace-data:';
const MARKETPLACE_TRANSACTIONS_KEY = 'farmer-marketplace-transactions';

type StoredAccount = {
  user: UserAccount;
  passwordHash: string;
  passwordSalt: string;
};

const readAccounts = (): StoredAccount[] => {
  try {
    const accounts: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    return Array.isArray(accounts) ? accounts as StoredAccount[] : [];
  } catch {
    return [];
  }
};

const hashPassword = async (password: string, saltHex?: string) => {
  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{2}/g) || [], (byte) => parseInt(byte, 16))
    : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    key,
    256
  );
  return {
    passwordHash: Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join(''),
    passwordSalt: Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join(''),
  };
};

export const registerAccount = async (userData: Partial<UserAccount>, password: string) => {
  const email = userData.email?.trim().toLowerCase();
  if (!email || !userData.name?.trim()) throw new Error('Name and email are required.');
  if (readAccounts().some((account) => account.user.email.toLowerCase() === email)) {
    throw new Error('This email is already registered.');
  }
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');

  const user: UserAccount = {
    ...userData,
    name: userData.name.trim(),
    email,
    provider: 'email',
    accountType: userData.accountType || 'user',
  };
  const accounts = readAccounts();
  accounts.push({ user, ...await hashPassword(password) });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return { user, token: email };
};

const apiRequest = async <T,>(path: string, body: Record<string, unknown> = {}) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed.');
  }

  return payload as T;
};

export const requestEmailVerification = async (email: string, name?: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Email is required.');
  return apiRequest<{ success: boolean; message: string }>('/api/send-verification', {
    email: normalizedEmail,
    name: name || 'User',
  });
};

export const verifyEmailCode = async (email: string, code: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !code.trim()) {
    throw new Error('Verification code is required.');
  }

  return apiRequest<{ success: boolean; message: string }>('/api/verify-code', {
    email: normalizedEmail,
    code: code.trim(),
  });
};

export const loginAccount = async (emailValue: string, password: string) => {
  const email = emailValue.trim().toLowerCase();
  const account = readAccounts().find((entry) => entry.user.email.toLowerCase() === email);
  if (!account || account.passwordHash !== (await hashPassword(password, account.passwordSalt)).passwordHash) {
    throw new Error('Incorrect email or password.');
  }
  saveAuthToken(email, account.user);
  return { user: account.user, token: email };
};

export const loadCurrentAccount = async () => {
  const user = localStorage.getItem(SESSION_USER_KEY);
  if (!user) throw new Error('No saved session.');
  return { user: JSON.parse(user) as UserAccount };
};

export const saveAuthToken = (token: string, user?: UserAccount) => {
  localStorage.setItem(TOKEN_KEY, token.trim().toLowerCase());
  if (user) {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    const accounts = readAccounts();
    const accountIndex = accounts.findIndex((account) => account.user.email.toLowerCase() === user.email.toLowerCase());
    if (accountIndex < 0) {
      accounts.push({ user, passwordHash: '', passwordSalt: '' });
    } else {
      accounts[accountIndex] = { ...accounts[accountIndex], user };
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
};

export const clearLegacyDemoData = () => {
  const accounts = readAccounts();
  const legacyDemoEmails = new Set(
    Array.from(LEGACY_DEMO_ACCOUNT_EMAILS).filter((email) =>
      !accounts.some(
        (account) => account.user.email.toLowerCase() === email && account.passwordHash
      )
    )
  );
  const remainingAccounts = accounts.filter(
    (account) => !legacyDemoEmails.has(account.user.email.toLowerCase())
  );
  if (remainingAccounts.length !== accounts.length) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(remainingAccounts));
  }

  legacyDemoEmails.forEach((email) => {
    localStorage.removeItem(`${DATA_KEY_PREFIX}${email}`);
  });

  const raw: unknown = JSON.parse(localStorage.getItem(MARKETPLACE_TRANSACTIONS_KEY) || '[]');
  if (!Array.isArray(raw)) throw new Error('Saved marketplace sales data is invalid.');
  const transactions = raw as MarketplaceTransaction[];
  const remainingTransactions = transactions.filter(
    (transaction) => !legacyDemoEmails.has(transaction.buyerEmail.toLowerCase())
      && !legacyDemoEmails.has(transaction.sellerEmail.toLowerCase())
  );
  if (remainingTransactions.length !== transactions.length) {
    localStorage.setItem(MARKETPLACE_TRANSACTIONS_KEY, JSON.stringify(remainingTransactions));
  }

  const sessionEmail = localStorage.getItem(TOKEN_KEY)?.trim().toLowerCase();
  if (sessionEmail && legacyDemoEmails.has(sessionEmail)) clearAuthToken();
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const updateAccountProfile = async (profile: Partial<UserAccount>) => {
  const email = getAuthToken();
  const currentUser = await loadCurrentAccount().then(({ user }) => user);
  const user = { ...currentUser, ...profile, email: currentUser.email };
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex((entry) => entry.user.email.toLowerCase() === (email || '').toLowerCase());
  if (accountIndex >= 0) {
    accounts[accountIndex] = { ...accounts[accountIndex], user };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  return { user };
};

const readUserData = (email: string): Record<string, unknown> => {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(`${DATA_KEY_PREFIX}${email.toLowerCase()}`) || '{}');
    return data && typeof data === 'object' ? data as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

export const loadAccountData = async <T,>(key: string) => {
  const email = getAuthToken();
  if (!email) return { data: null as T | null };
  return { data: (readUserData(email)[key] as T | undefined) || null };
};

export const saveAccountData = async <T,>(key: string, data: T) => {
  const email = getAuthToken();
  if (!email) throw new Error('Sign in to save account data.');
  const userData = readUserData(email);
  userData[key] = data;
  localStorage.setItem(`${DATA_KEY_PREFIX}${email.toLowerCase()}`, JSON.stringify(userData));
  return { data };
};

export const loadMarketplaceTransactions = async (sellerEmail: string) => {
  const raw: unknown = JSON.parse(localStorage.getItem(MARKETPLACE_TRANSACTIONS_KEY) || '[]');
  if (!Array.isArray(raw)) throw new Error('Saved marketplace sales data is invalid.');
  return {
    transactions: (raw as MarketplaceTransaction[]).filter(
      (transaction) => transaction.sellerEmail.toLowerCase() === sellerEmail.trim().toLowerCase()
    ),
  };
};

export const loadMarketplaceTransactionsForBuyer = async (buyerEmail: string) => {
  const raw: unknown = JSON.parse(localStorage.getItem(MARKETPLACE_TRANSACTIONS_KEY) || '[]');
  if (!Array.isArray(raw)) throw new Error('Saved marketplace sales data is invalid.');
  return {
    transactions: (raw as MarketplaceTransaction[]).filter(
      (transaction) => transaction.buyerEmail.toLowerCase() === buyerEmail.trim().toLowerCase()
    ),
  };
};

export const recordMarketplaceTransaction = async (transaction: MarketplaceTransaction) => {
  const raw: unknown = JSON.parse(localStorage.getItem(MARKETPLACE_TRANSACTIONS_KEY) || '[]');
  if (!Array.isArray(raw)) throw new Error('Saved marketplace sales data is invalid.');
  const transactions = raw as MarketplaceTransaction[];
  if (transactions.some((saved) => saved.id === transaction.id)) {
    throw new Error('This order has already been recorded.');
  }
  localStorage.setItem(MARKETPLACE_TRANSACTIONS_KEY, JSON.stringify([transaction, ...transactions]));
  return { transaction };
};

export const updateMarketplaceTransaction = async (
  sellerEmail: string,
  transactionId: string,
  status: MarketplaceTransaction['status']
) => {
  const raw: unknown = JSON.parse(localStorage.getItem(MARKETPLACE_TRANSACTIONS_KEY) || '[]');
  if (!Array.isArray(raw)) throw new Error('Saved marketplace sales data is invalid.');
  let updated = false;
  const transactions = (raw as MarketplaceTransaction[]).map((transaction) => {
    if (
      transaction.id !== transactionId
      || transaction.sellerEmail.toLowerCase() !== sellerEmail.trim().toLowerCase()
    ) return transaction;
    updated = true;
    return { ...transaction, status };
  });
  if (!updated) throw new Error('The requested sale was not found for this seller.');
  localStorage.setItem(MARKETPLACE_TRANSACTIONS_KEY, JSON.stringify(transactions));
  return {
    transactions: transactions.filter(
      (transaction) => transaction.sellerEmail.toLowerCase() === sellerEmail.trim().toLowerCase()
    ),
  };
};

export const loadMarketplaceListings = async () => {
  const products = readAccounts().flatMap<Product>((account): Product[] => {
    if (account.user.accountType === 'farmer') {
      const snapshot = readUserData(account.user.email)['farmer-dashboard'] as { products?: Product[] } | undefined;
      return Array.isArray(snapshot?.products)
        ? snapshot.products
          .filter((product) => !LEGACY_DEMO_PRODUCT_IDS.has(product.id))
          .map((product) => ({
            ...product,
            sellerType: 'farmer' as const,
            sellerEmail: account.user.email,
            sellerName: account.user.name,
          }))
        : [];
    }
    if (account.user.accountType === 'agri-business') {
      const snapshot = readUserData(account.user.email)['agri-business-dashboard'] as { products?: Product[] } | undefined;
      return Array.isArray(snapshot?.products)
        ? snapshot.products
          .filter((product) => !LEGACY_DEMO_PRODUCT_IDS.has(product.id))
          .map((product) => ({
            ...product,
            sellerType: 'agri-business' as const,
            sellerName: account.user.businessName || account.user.name,
            sellerLocation: [account.user.district, account.user.state].filter(Boolean).join(', '),
            sellerEmail: account.user.email,
          }))
        : [];
    }
    return [];
  });
  return { products };
};
