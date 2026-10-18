import { UserAccount } from '../types/auth';
import { MarketplaceTransaction, Order, Product } from '../types/dashboard';
import { LEGACY_DEMO_ACCOUNT_EMAILS, LEGACY_DEMO_PRODUCT_IDS } from '../data/legacyDemoIds';

const TOKEN_KEY = 'farmer-marketplace-session-email';
const SERVER_SESSION_KEY = 'farmer-marketplace-server-session';
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
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');

  const user: UserAccount = {
    ...userData,
    name: userData.name.trim(),
    email,
    provider: 'email',
    accountType: userData.accountType || 'user',
  };
  const response = await apiRequest<{ user: UserAccount; sessionToken: string }>('/api/auth/register', {
    user,
    password,
  });
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex((account) => account.user.email.toLowerCase() === email);
  const credentials = await hashPassword(password);
  if (accountIndex < 0) accounts.push({ user: response.user, ...credentials });
  else accounts[accountIndex] = { user: response.user, ...credentials };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return { user: response.user, token: email, sessionToken: response.sessionToken };
};

const apiRequest = async <T,>(
  path: string,
  body?: Record<string, unknown>,
  method = 'POST'
) => {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem(SERVER_SESSION_KEY)
          ? { Authorization: `Bearer ${localStorage.getItem(SERVER_SESSION_KEY)}` }
          : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Cannot reach the application backend. Open a second terminal and run `npm run server`.');
  }

  const responseText = await response.text();
  let payload: { error?: string } = {};
  try {
    payload = JSON.parse(responseText) as { error?: string };
  } catch {
    if (response.ok) throw new Error('The application backend returned an invalid response.');
  }
  if (!response.ok) {
    throw new Error(
      payload.error
      || (response.status === 502 || response.status === 503
        ? 'The Node.js application backend is not running. Open a second terminal and run `npm run server`.'
        : `The application backend request failed (HTTP ${response.status}). Check the Node.js server.`)
    );
  }

  return payload as T;
};

export const requestPasswordReset = async (emailValue: string) => {
  const email = emailValue.trim().toLowerCase();
  if (!email) throw new Error('Email is required.');
  return apiRequest<{ success: boolean; message: string }>('/api/send-password-reset', { email });
};

export const resetAccountPassword = async (emailValue: string, code: string, newPassword: string) => {
  const email = emailValue.trim().toLowerCase();
  if (!email || !code.trim()) throw new Error('Email and reset code are required.');
  if (newPassword.length < 8) throw new Error('Password must contain at least 8 characters.');

  await apiRequest<{ success: boolean }>('/api/reset-password', {
    email,
    code: code.trim(),
    newPassword,
  });

  const accounts = readAccounts();
  const accountIndex = accounts.findIndex((account) => account.user.email.toLowerCase() === email);
  if (accountIndex >= 0) {
    accounts[accountIndex] = { ...accounts[accountIndex], ...await hashPassword(newPassword) };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  return { success: true };
};

export const loginAccount = async (emailValue: string, password: string) => {
  const email = emailValue.trim().toLowerCase();
  let response: { user: UserAccount; sessionToken: string };
  try {
    response = await apiRequest<{ user: UserAccount; sessionToken: string }>('/api/auth/login', {
      email,
      password,
    });
  } catch (loginError) {
    const legacyAccount = readAccounts().find((entry) => entry.user.email.toLowerCase() === email);
    if (
      !legacyAccount?.passwordSalt
      || legacyAccount.passwordHash !== (await hashPassword(password, legacyAccount.passwordSalt)).passwordHash
    ) {
      throw loginError;
    }
    response = await apiRequest<{ user: UserAccount; sessionToken: string }>('/api/auth/register', {
      user: legacyAccount.user,
      password,
    });
  }
  return { user: response.user, token: email, sessionToken: response.sessionToken };
};

export const loadCurrentAccount = async () => {
  if (!localStorage.getItem(SERVER_SESSION_KEY)) throw new Error('No saved session.');
  return apiRequest<{ user: UserAccount }>('/api/auth/session', undefined, 'GET');
};

export const saveAuthToken = (token: string, user?: UserAccount, sessionToken?: string) => {
  localStorage.setItem(TOKEN_KEY, token.trim().toLowerCase());
  if (sessionToken) localStorage.setItem(SERVER_SESSION_KEY, sessionToken);
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
  const sessionToken = localStorage.getItem(SERVER_SESSION_KEY);
  if (sessionToken) {
    void fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
    }).catch((error: unknown) => {
      console.error('Could not revoke the server session:', error);
    });
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SERVER_SESSION_KEY);
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
  const { user } = await apiRequest<{ user: UserAccount }>('/api/auth/profile', { profile }, 'PATCH');
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex((entry) => entry.user.email.toLowerCase() === user.email.toLowerCase());
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
  if (!getAuthToken()) return { data: null as T | null };
  return apiRequest<{ data: T | null }>(`/api/account-data/${encodeURIComponent(key)}`, undefined, 'GET');
};

export const saveAccountData = async <T,>(key: string, data: T) => {
  if (!getAuthToken()) throw new Error('Sign in to save account data.');
  return apiRequest<{ data: T }>(`/api/account-data/${encodeURIComponent(key)}`, { data }, 'PUT');
};

export const recordFarmerOrder = async (sellerEmail: string, order: Order) => {
  return apiRequest<{ order: Order }>('/api/orders', {
    id: order.id,
    sellerEmail: sellerEmail.trim().toLowerCase(),
    productId: order.productId,
    productName: order.productName,
    quantity: order.quantity,
    unit: order.unit,
    unitPrice: order.quantity ? order.totalPrice / order.quantity : 0,
    deliveryAddress: order.deliveryAddress,
  });
};

export const loadFarmerOrders = async () =>
  apiRequest<{ orders: Order[] }>('/api/farmer/orders', undefined, 'GET');

export const updateFarmerOrderStatus = async (orderId: string, status: Order['status']) =>
  apiRequest<{ order: Order }>(`/api/farmer/orders/${encodeURIComponent(orderId)}/status`, { status }, 'PATCH');

export const migrateLegacyAccountData = async () => {
  const email = getAuthToken();
  if (!email) return;
  const legacyData = readUserData(email);
  for (const key of [
    'farmer-dashboard',
    'agri-business-dashboard',
    'customer-orders',
    'farmer-agri-orders',
  ]) {
    if (!Object.hasOwn(legacyData, key)) continue;
    const { data } = await loadAccountData(key);
    if (data === null) await saveAccountData(key, legacyData[key]);
  }
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
  const { products } = await apiRequest<{ products: Product[] }>('/api/marketplace/listings', undefined, 'GET');
  return {
    products: products.filter((product) => !LEGACY_DEMO_PRODUCT_IDS.has(product.id)),
  };
};
