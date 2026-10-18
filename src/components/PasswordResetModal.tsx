import React, { useEffect, useState } from 'react';
import { KeyRound, Mail, X } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  initialEmail: string;
  onClose: () => void;
  onRequestCode: (email: string) => Promise<void>;
  onResetPassword: (email: string, code: string, password: string) => Promise<void>;
  onComplete: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  initialEmail,
  onClose,
  onRequestCode,
  onResetPassword,
  onComplete,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEmail(initialEmail);
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setCodeSent(false);
    setErrorMessage(null);
    setNotice(null);
  }, [initialEmail, isOpen]);

  if (!isOpen) return null;

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);
    try {
      await onRequestCode(email);
      setCodeSent(true);
      setNotice(`A password reset code was sent to ${email.trim()}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send a password reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setErrorMessage('Enter the 6-digit code sent to your email.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onResetPassword(email, code, password);
      onComplete();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);
    try {
      await onRequestCode(email);
      setNotice(`A fresh password reset code was sent to ${email.trim()}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to resend the password reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-sm rounded-[32px] border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close password reset"
          className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="my-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8E85FF]/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8E85FF] text-white">
              {codeSent ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-1 text-center">
          <h2 className="text-lg font-bold">{codeSent ? 'Reset your password' : 'Forgot your password?'}</h2>
          <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-slate-500">
            {codeSent
              ? <>Enter the code sent to <span className="font-medium text-slate-700">{email.trim()}</span> and choose a new password.</>
              : 'We will email you a code to verify your account.'}
          </p>
        </div>

        {!codeSent ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <label className="block text-xs font-medium text-slate-700">
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAFAFA] px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </label>
            {errorMessage && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorMessage}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-[#D2F442] px-4 py-3 text-xs font-bold text-slate-950 hover:bg-[#c6ec32] disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3">
            {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{notice}</p>}
            <label className="block text-xs font-medium text-slate-700">
              6-digit email code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAFAFA] px-4 py-3 text-xs tracking-[0.3em] text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAFAFA] px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAFAFA] px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </label>
            {errorMessage && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorMessage}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-[#D2F442] px-4 py-3 text-xs font-bold text-slate-950 hover:bg-[#c6ec32] disabled:opacity-60"
            >
              {isSubmitting ? 'Updating...' : 'Reset password'}
            </button>
            <div className="flex justify-between text-xs">
              <button type="button" onClick={() => { setCodeSent(false); setCode(''); setNotice(null); setErrorMessage(null); }} className="font-semibold text-slate-500 hover:text-slate-900">
                Use another email
              </button>
              <button type="button" onClick={() => void handleResendCode()} disabled={isSubmitting} className="font-semibold text-[#8E85FF] hover:underline disabled:opacity-60">
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
