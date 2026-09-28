import AsyncStorage from '@react-native-async-storage/async-storage';

import { LocalAuthRepository } from '@/api/local/authRepository';
import { EmailTakenError, InvalidCredentialsError } from '@/api/types';

// Stand-in for SHA-256 so the test doesn't need the native crypto module.
const fakeHash = async (text: string) => `hashed:${text.split('').reverse().join('')}`;

describe('LocalAuthRepository', () => {
  const repository = new LocalAuthRepository(fakeHash);
  const account = { name: 'Elena', email: 'Elena@Example.com', password: 'secret123' };

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('signs up, logs the user in and never stores the password', async () => {
    const user = await repository.signUp(account);

    expect(user).toMatchObject({ name: 'Elena', email: 'elena@example.com' });
    expect(await repository.currentUser()).toEqual(user);
    expect(JSON.stringify(await AsyncStorage.getItem('accounts:v1'))).not.toContain('secret123');
  });

  it('refuses a second account with the same email, whatever the case', async () => {
    await repository.signUp(account);
    await expect(repository.signUp({ ...account, email: 'elena@example.com ' })).rejects.toBeInstanceOf(
      EmailTakenError,
    );
  });

  it('logs in with the right password only', async () => {
    const user = await repository.signUp(account);
    await repository.logOut();
    expect(await repository.currentUser()).toBeNull();

    await expect(repository.logIn({ email: account.email, password: 'wrong' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    await expect(repository.logIn({ email: 'ELENA@example.com', password: 'secret123' })).resolves.toEqual(user);
  });
});
