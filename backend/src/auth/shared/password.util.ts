import * as bcrypt from 'bcrypt';

const DEFAULT_BCRYPT_ROUNDS = 10;

function getBcryptRounds(): number {
  const rawRounds = process.env.BCRYPT_ROUNDS;
  const rounds = Number(rawRounds);
  if (Number.isInteger(rounds) && rounds > 0) {
    return rounds;
  }
  return DEFAULT_BCRYPT_ROUNDS;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, getBcryptRounds());
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
