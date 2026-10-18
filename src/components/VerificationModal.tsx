import React, { useState, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onVerify,
  onResend,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const nextDigits = [...digits];
    nextDigits[index] = value;
    setDigits(nextDigits);
    setErrorMessage(null);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = digits.join('');

    if (enteredCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      await onVerify(enteredCode);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to verify the code.');
      setDigits(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center my-4">
          <div className="w-16 h-16 rounded-full bg-[#8E85FF]/20 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-[#8E85FF] flex items-center justify-center text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-1 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Verification code</h2>
          <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
            Enter the 6-digit code sent to <span className="text-slate-700 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-center gap-2 mb-4">
            {digits.map((digit, idx) => {
              const isFilled = digit !== '';
              const isSecondActive = idx === 1 && isFilled;
              return (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-9 h-11 text-center text-base font-bold rounded-full transition-all focus:outline-none ${
                    isSecondActive
                      ? 'bg-[#8E85FF] text-white shadow-sm ring-2 ring-[#8E85FF]/30'
                      : isFilled
                      ? 'bg-[#F4F5F2] text-slate-900 border border-slate-200'
                      : 'bg-white border border-slate-200 text-slate-900 focus:border-[#8E85FF]'
                  }`}
                />
              );
            })}
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 px-4 bg-[#D2F442] hover:bg-[#c6ec32] active:scale-[0.99] text-slate-950 font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center disabled:opacity-60"
          >
            {isVerifying ? 'Confirming...' : 'Confirm'}
          </button>
        </form>

        <div className="text-center pt-4 text-xs text-slate-500">
          <span>Didn't receive the code? </span>
          <button
            type="button"
            onClick={async () => {
              try {
                await onResend();
                setDigits(['', '', '', '', '', '']);
                setErrorMessage('A fresh verification code has been sent to your email.');
                inputRefs[0].current?.focus();
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Unable to resend the verification code.');
              }
            }}
            className="font-bold text-[#8E85FF] hover:underline cursor-pointer"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};
