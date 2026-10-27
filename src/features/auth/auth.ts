import { ROLE_META, type Role, type User } from '../../data/users';

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; field: 'email' | 'password' | 'role' | 'phone' | 'code'; error: string };

export function authenticate(users: User[], email: string, password: string, role: Role): AuthResult {
  const e = email.trim().toLowerCase();
  if (!e) return { ok: false, field: 'email', error: 'Enter your email.' };
  const user = users.find((u) => u.email.toLowerCase() === e);
  if (!user) return { ok: false, field: 'email', error: 'No account found for that email.' };
  if (user.password !== password) return { ok: false, field: 'password', error: 'Wrong password. Demo accounts use demo1234.' };
  if (user.role !== role) {
    const label = ROLE_META[user.role].label;
    return { ok: false, field: 'role', error: `This account is registered as ${label}. Select ${label} to continue.` };
  }
  return { ok: true, user };
}

export type RegisterResult = { ok: true } | { ok: false; error: string };

export function validateRegistration(users: User[], name: string, email: string, password: string, role: Role): RegisterResult {
  if (role === 'district') return { ok: false, error: 'District officer accounts are invite-only. Ask your state admin for an invite.' };
  if (role === 'board') return { ok: false, error: 'Board accounts are invite-only. Ask the union secretary for an invite.' };
  if (name.trim().length < 2) return { ok: false, error: 'Enter your full name.' };
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return { ok: false, error: 'Enter a valid email.' };
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
    return { ok: false, error: 'That email already has an account. Sign in instead.' };
  if (password.length < 8) return { ok: false, error: 'Use at least 8 characters for your password.' };
  return { ok: true };
}

export const normalisePhone = (p: string) => p.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');

export function findByPhone(users: User[], phone: string, role: Role): AuthResult {
  const p = normalisePhone(phone);
  if (p.length !== 10) return { ok: false, field: 'phone', error: 'Enter a 10-digit mobile number.' };
  const user = users.find((u) => u.phone === p);
  if (!user) return { ok: false, field: 'phone', error: 'No account found for that number.' };
  if (user.role !== role) {
    const label = ROLE_META[user.role].label;
    return { ok: false, field: 'role', error: `This account is registered as ${label}. Select ${label} to continue.` };
  }
  return { ok: true, user };
}
