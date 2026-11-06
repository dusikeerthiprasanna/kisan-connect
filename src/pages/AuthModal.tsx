import React, { useState } from 'react';
import { useStore } from '../services/store';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next';
import { AP_REFERENCE_HUBS } from '../utils/geo';
import { X, Phone, KeyRound, User, MapPin, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { loginWithPhone } = useStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+91 98480 98765');
  const [name, setName] = useState('Ramesh Babu');
  const [role, setRole] = useState<UserRole>('farmer');
  const [village, setVillage] = useState('Poranki');
  const [district, setDistrict] = useState('NTR (Vijayawada)');
  const [otp, setOtp] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    const success = loginWithPhone(phone, otp, role, name, village, district);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#171F1A] rounded-xl shadow-matte-lg overflow-hidden border border-[#E2E6E2] dark:border-[#233027]"
        role="dialog"
        aria-label="Login or Sign Up"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between bg-[#F7F9F7] dark:bg-[#151D18]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#19261E] dark:text-[#E5ECE7]">
              {step === 'phone' ? 'Sign In / Register' : 'Verify Mobile OTP'}
            </h2>
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
              {step === 'phone' ? 'Enter phone number for instant access' : `Code sent to ${phone}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] hover:bg-[#F0F2F0] dark:hover:bg-[#1E2922] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider mb-2">
                  Select Your Platform Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      role === 'farmer'
                        ? 'border-[#1E3A2F] bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#1E3A2F] dark:text-[#A8BEB1] font-semibold'
                        : 'border-[#E2E6E2] dark:border-[#233027] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7]'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">Farmer</div>
                    <div className="text-[11px] text-[#5C6E63] dark:text-[#95A69B]">Rents machinery</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      role === 'owner'
                        ? 'border-[#1E3A2F] bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#1E3A2F] dark:text-[#A8BEB1] font-semibold'
                        : 'border-[#E2E6E2] dark:border-[#233027] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7]'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">Equipment Owner</div>
                    <div className="text-[11px] text-[#5C6E63] dark:text-[#95A69B]">Lists machinery</div>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6E63]" strokeWidth={1.8} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6E63]" strokeWidth={1.8} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-mono font-bold text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
                  />
                </div>
              </div>

              {/* Village & District */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village"
                    className="w-full p-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs text-[#19261E] dark:text-[#E5ECE7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs text-[#19261E] dark:text-[#E5ECE7]"
                  >
                    <option value="NTR (Vijayawada)">NTR (Vijayawada)</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Eluru">Eluru</option>
                    <option value="Krishna">Krishna</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-matte-sm transition-colors mt-2"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-[#EEF5F0] dark:bg-[#1A2E22] p-3 rounded-lg border border-[#CCE0D2] dark:border-[#2B4B37] text-xs text-[#245835] dark:text-[#88C49E] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Demo OTP code is <strong className="font-mono">123456</strong> (or check SMS).
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6E63]" strokeWidth={1.8} />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-base font-mono font-bold tracking-widest text-center text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 py-2.5 bg-[#F0F2F0] dark:bg-[#1C2520] hover:bg-[#E5ECE7] text-[#19261E] dark:text-[#E5ECE7] rounded-lg text-xs font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-matte-sm transition-colors"
                >
                  Verify & Enter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
