import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { EmailTakenError, InvalidCredentialsError, type AuthRepository } from '@/api/types';
import type { User } from '@/models/user';
import { generateId } from '@/utils/id';

const ACCOUNTS_KEY = 'accounts:v1';
const SESSION_KEY = 'session:v1';

interface StoredAccount {
  user: User;
  salt: string;
  passwordHash: string;
}

export type HashFn = (text: string) => Promise<string>;

const sha256: HashFn = (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function readAccounts(): Promise<StoredAccount[]> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
}

/**
 * Mock accounts stored on the device (there is no backend yet). Passwords are
 * never stored, only a salted SHA-256 hash, so the demo doesn't teach bad
 * habits; this is still not a substitute for server-side authentication.
 */
export class LocalAuthRepository implements AuthRepository {
  constructor(private readonly hash: HashFn = sha256) {}

  async currentUser(): Promise<User | null> {
    const userId = await AsyncStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const account = (await readAccounts()).find((stored) => stored.user.id === userId);
    return account?.user ?? null;
  }

  async signUp(input: { name: string; email: string; password: string }): Promise<User> {
    const accounts = await readAccounts();
    const email = normaliseEmail(input.email);
    if (accounts.some((stored) => stored.user.email === email)) {
      throw new EmailTakenError();
    }
    const salt = generateId('salt');
    const user: User = { id: generateId('user'), name: input.name.trim(), email };
    accounts.push({ user, salt, passwordHash: await this.hash(salt + input.password) });
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    await AsyncStorage.setItem(SESSION_KEY, user.id);
    return user;
  }

  async logIn(input: { email: string; password: string }): Promise<User> {
    const email = normaliseEmail(input.email);
    const account = (await readAccounts()).find((stored) => stored.user.email === email);
    if (!account || (await this.hash(account.salt + input.password)) !== account.passwordHash) {
      throw new InvalidCredentialsError();
    }
    await AsyncStorage.setItem(SESSION_KEY, account.user.id);
    return account.user;
  }

  async logOut(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}
