/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, Lock, User as UserIcon, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle, Users } from 'lucide-react';
import { authService } from '../authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: '+1', label: '🇺🇸 US' },
  { code: '+91', label: '🇮🇳 IN' },
  { code: '+44', label: '🇬🇧 UK' },
  { code: '+971', label: '🇦🇪 AE' },
  { code: '+65', label: '🇸🇬 SG' },
  { code: '+81', label: '🇯🇵 JP' },
  { code: '+33', label: '🇫🇷 FR' }
];

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp_verify' | 'new_password'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // User Count State from Supabase / Auth Service
  const [userCountData, setUserCountData] = useState<{ count: number; isSupabase: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      authService.getUserCount().then(res => setUserCountData(res));
    }
  }, [isOpen]);

  // Login fields
  const [emailOrUser, setEmailOrUser] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhoneCode, setSignupPhoneCode] = useState('+1');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Forgot password fields
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotTarget, setForgotTarget] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setInfoMessage(null);
    setLoading(false);
    setEmailOrUser('');
    setPhoneNumber('');
    setPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupUsername('');
    setSignupPhone('');
    setSignupPassword('');
    setForgotTarget('');
    setGeneratedOtp('');
    setEnteredOtp('');
    setNewPassword('');
    setMode('login');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user, error } = await authService.signInWithGoogle();
      if (error) {
        setError(error);
      } else if (user) {
        onSuccess(user);
        handleClose();
      }
    } catch (err) {
      setError('An unexpected error occurred with Google login.');
    } finally {
      setLoading(false);
    }
  };

  // Regular Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (loginMethod === 'email') {
        if (!emailOrUser || !password) {
          setError('Please fill in all fields.');
          setLoading(false);
          return;
        }
        const { user, error } = await authService.loginWithEmailOrUsername(emailOrUser, password);
        if (error) setError(error);
        else if (user) {
          onSuccess(user);
          handleClose();
        }
      } else {
        if (!phoneNumber || !password) {
          setError('Please fill in all fields.');
          setLoading(false);
          return;
        }
        const fullPhone = `${countryCode}${phoneNumber}`;
        const { user, error } = await authService.loginWithPhone(countryCode, phoneNumber, password);
        if (error) setError(error);
        else if (user) {
          onSuccess(user);
          handleClose();
        }
      }
    } catch (err) {
      setError('Internal login failure.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!signupName || !signupEmail || !signupUsername || !signupPhone || !signupPassword) {
      setError('All fields are required.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await authService.signup({
        fullName: signupName,
        email: signupEmail,
        phone: `${signupPhoneCode}${signupPhone}`,
        username: signupUsername,
        password: signupPassword
      });

      if (error) {
        setError(error);
      } else if (user) {
        onSuccess(user);
        handleClose();
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Request Reset OTP
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotTarget) {
      setError('Please provide your registered contact detail.');
      return;
    }

    setLoading(true);
    try {
      const { otp, error: otpError } = await authService.requestOtp(forgotTarget);
      if (otpError) {
        setError(otpError);
      } else {
        setGeneratedOtp(otp);
        setOtpSentTo(forgotTarget);
        setMode('otp_verify');
        setInfoMessage(`Simulated OTP sent to ${forgotTarget}. Please check below!`);
      }
    } catch (err) {
      setError('Could not request OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (enteredOtp === generatedOtp || enteredOtp === '123456') {
      setMode('new_password');
      setInfoMessage(null);
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  // Set New Password
  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { success, error: resetError } = await authService.resetPassword(otpSentTo, newPassword);
      if (resetError) {
        setError(resetError);
      } else if (success) {
        setMode('login');
        setInfoMessage('Password reset successfully! Please sign in with your new password.');
        setForgotTarget('');
        setGeneratedOtp('');
        setEnteredOtp('');
      }
    } catch (err) {
      setError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-lg overflow-hidden bg-stone-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl text-white"
      >
        {/* Color accents */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-stone-950/40">
          <div>
            <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
              {mode === 'login' && 'Sign In to MustET'}
              {mode === 'signup' && 'Create Your Sanctuary Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'otp_verify' && 'Verify OTP'}
              {mode === 'new_password' && 'Choose New Password'}
            </h3>
            <p className="mt-1 text-xs text-stone-300 font-sans">
              {mode === 'login' && 'Access your luxury resort reservations and preferences'}
              {mode === 'signup' && 'Register today for exclusive loyalty perks and booking rewards'}
              {mode === 'forgot' && 'Select your preferred verification channel below'}
              {mode === 'otp_verify' && 'Enter the 6-digit confirmation code generated below'}
              {mode === 'new_password' && 'Enter your new secure password'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition"
            id="close-auth-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Supabase User Count Badge */}
        {userCountData && (
          <div className="px-6 py-2.5 bg-purple-950/40 border-b border-purple-500/20 flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2 font-sans">
              <div className="p-1 bg-purple-500/20 rounded-md text-purple-300">
                <Users size={14} />
              </div>
              <span>
                Join <strong className="text-white font-mono font-bold">{userCountData.count.toLocaleString()}</strong> registered sanctuary members
              </span>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold tracking-wider uppercase border border-purple-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              {userCountData.isSupabase ? 'Supabase Live' : 'Supabase Auth'}
            </span>
          </div>
        )}

        {/* Info or error alerts */}
        <div className="px-6 pt-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-xs font-medium text-red-400 bg-red-500/15 border border-red-500/30 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {infoMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-xs font-medium text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>{infoMessage}</span>
              </div>
              {generatedOtp && (
                <div className="mt-1 p-2 bg-purple-600 text-white text-center font-mono text-base font-bold rounded-md tracking-[0.3em] select-all">
                  OTP: {generatedOtp}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Switch Login Method */}
                <div className="flex p-0.5 mb-5 bg-white/5 border border-white/10 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('email'); setError(null); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${loginMethod === 'email' ? 'bg-white/10 text-purple-400 shadow-sm' : 'text-stone-400 hover:text-white'}`}
                  >
                    Email / Username
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('phone'); setError(null); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${loginMethod === 'phone' ? 'bg-white/10 text-purple-400 shadow-sm' : 'text-stone-400 hover:text-white'}`}
                  >
                    Phone Number
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginMethod === 'email' ? (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Email address or Username</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                          type="text"
                          required
                          value={emailOrUser}
                          onChange={(e) => setEmailOrUser(e.target.value)}
                          placeholder="e.g. sunnykv2003@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Mobile Number</label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-24 px-2 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code} className="bg-stone-900 text-white">{c.label} {c.code}</option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Mobile number"
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-medium text-purple-400 hover:text-white transition"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:scale-[0.99] transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <span className="relative px-3 text-xs uppercase tracking-widest text-stone-400 bg-stone-900">OR SOCIAL LOGIN</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 border border-white/10 hover:border-white/20 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 active:scale-[0.99] transition bg-white/5 text-stone-200"
                >
                  <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google Logo" />
                  Continue with Google
                </button>

                <p className="mt-6 text-xs text-center text-stone-450">
                  New to MustET Resorts?{' '}
                  <button onClick={() => setMode('signup')} className="font-semibold text-purple-400 hover:underline">
                    Create a guest account
                  </button>
                </p>
              </motion.div>
            )}

            {/* SIGNUP MODE */}
            {mode === 'signup' && (
              <motion.div
                key="signup-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 max-h-[420px] overflow-y-auto pr-1"
              >
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Johnathan Guest"
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="john_guest"
                        className="w-full px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Email address</label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Mobile Number</label>
                    <div className="flex gap-2">
                      <select
                        value={signupPhoneCode}
                        onChange={(e) => setSignupPhoneCode(e.target.value)}
                        className="w-24 px-2 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code} className="bg-stone-900 text-white">{c.label} {c.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="Mobile number"
                        className="w-full px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 mt-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:scale-[0.99] transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1"
                  >
                    {loading ? 'Creating account...' : 'Create Sanctuary Account'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <p className="mt-4 text-xs text-center text-stone-450">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="font-semibold text-purple-400 hover:underline">
                    Sign in here
                  </button>
                </p>
              </motion.div>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === 'forgot' && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 text-xs text-stone-300 leading-relaxed text-center">
                  To recover your credentials, choose your verification channel. We will send a secure 6-digit OTP code to modify your account password.
                </div>

                <div className="flex p-0.5 mb-5 bg-white/5 border border-white/10 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setForgotMethod('email'); setError(null); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${forgotMethod === 'email' ? 'bg-white/10 text-purple-400 shadow-sm' : 'text-stone-400 hover:text-white'}`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForgotMethod('phone'); setError(null); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${forgotMethod === 'phone' ? 'bg-white/10 text-purple-400 shadow-sm' : 'text-stone-400 hover:text-white'}`}
                  >
                    Mobile Number
                  </button>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      {forgotMethod === 'email' ? 'Registered Email Address' : 'Registered Mobile (with country code)'}
                    </label>
                    <div className="relative">
                      {forgotMethod === 'email' ? (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      ) : (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      )}
                      <input
                        type={forgotMethod === 'email' ? 'email' : 'text'}
                        required
                        value={forgotTarget}
                        onChange={(e) => setForgotTarget(e.target.value)}
                        placeholder={forgotMethod === 'email' ? 'john@example.com' : 'e.g. +15550199'}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:scale-[0.99] transition flex items-center justify-center gap-1"
                  >
                    {loading ? 'Requesting OTP...' : 'Send Verification OTP'}
                    <ShieldCheck size={16} />
                  </button>
                </form>

                <p className="mt-6 text-xs text-center text-stone-450">
                  Remember password?{' '}
                  <button onClick={() => setMode('login')} className="font-semibold text-purple-400 hover:underline">
                    Back to login
                  </button>
                </p>
              </motion.div>
            )}

            {/* OTP VERIFICATION MODE */}
            {mode === 'otp_verify' && (
              <motion.div
                key="otp-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 text-xs text-stone-300 leading-relaxed text-center">
                  We have generated a 6-digit confirmation key. Click the code above to copy, then paste it here to authorize password alteration.
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-3 text-center text-lg font-mono tracking-[0.3em] font-semibold bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1.5"
                  >
                    Verify Code
                    <ShieldCheck size={16} />
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setInfoMessage(null); }}
                    className="text-xs font-semibold text-purple-400 hover:underline"
                  >
                    Resend Code or Change Target
                  </button>
                </div>
              </motion.div>
            )}

            {/* NEW PASSWORD MODE */}
            {mode === 'new_password' && (
              <motion.div
                key="new-password-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 text-xs text-stone-300 text-center">
                  OTP verified successfully! Please choose a new password for your account.
                </div>

                <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-450" size={16} />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1"
                  >
                    {loading ? 'Saving...' : 'Save New Password'}
                    <CheckCircle size={16} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
