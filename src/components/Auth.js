'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, MapPin, X, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, Sparkles, Timer } from 'lucide-react';
import { CEBU_ZONES } from '../lib/constants';

export default function Auth({ onAuthComplete }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lockout states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (lockoutTime) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = lockoutTime - now;
        if (distance <= 0) {
          setLockoutTime(null);
          setFailedAttempts(0);
          setTimeLeft(0);
          setError(null);
          clearInterval(timer);
        } else {
          setTimeLeft(Math.ceil(distance / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const filteredZones = CEBU_ZONES.filter(z =>
    z.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAuth = async (e) => {
    e.preventDefault();

    if (lockoutTime) {
      setError(`Too many failed attempts. Try again in ${timeLeft}s`);
      return;
    }

    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isLogin && !neighborhood) {
      setError("Please select your neighborhood");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);

          if (newAttempts >= 4) {
            const unlockAt = new Date().getTime() + 2 * 60 * 1000;
            setLockoutTime(unlockAt);
            setTimeLeft(120);
            throw new Error("Too many failed attempts. Account locked for 2 minutes.");
          }
          throw loginError;
        }
        setFailedAttempts(0);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              neighborhood: neighborhood,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data?.user && !data?.session) {
          setError("Success! Please check your email.");
          setLoading(false);
          return;
        }
      }
      onAuthComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbfcfd] dark:bg-[#050505] overflow-hidden font-sans relative">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/5 blur-[140px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-400/5 blur-[140px] rounded-full -ml-64 -mb-64 pointer-events-none"></div>

      {/* Left Panel: Visual/Brand */}
      <div className="hidden lg:block lg:w-[50%] relative overflow-hidden m-5 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-zinc-900 group">
        <img
          src="https://images.unsplash.com/photo-1652874136458-96303251a3d9?q=80&w=2000"
          alt="Cebu Skyline"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent"></div>

        <div className="absolute bottom-16 left-16 right-16 z-10 space-y-8">
          <div className="flex flex-col space-y-6">
             <div className="w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center shadow-2xl overflow-hidden">
               <img src="/logo.png" alt="CebSocial Logo" className="w-full h-full object-cover" />
             </div>
             <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
               Connect <br/>
               <span className="text-primary-400">Your Zone.</span>
             </h1>
          </div>

          <p className="text-white/70 text-xl max-w-sm font-medium leading-relaxed tracking-tight">
            The premium digital space for Cebuano neighbors to trade, share, and thrive together.
          </p>

          <div className="flex items-center gap-4 pt-6">
             <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2">
                <Sparkles size={16} className="text-primary-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Local & Verified</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Clean Auth Flow */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10 overflow-y-auto no-scrollbar">

        <div className="w-full max-w-[460px] animate-fade-in">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="CebSocial Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black text-main tracking-tighter uppercase italic">CebSocial</span>
          </div>

          <div className="mb-12">
            <h2 className="text-5xl font-black text-main tracking-tighter uppercase italic leading-none mb-4">
              {isLogin ? 'Welcome Back' : 'Join The Zone'}
            </h2>
            <p className="text-muted text-[16px] font-medium leading-relaxed">
              {isLogin ? 'Enter your credentials to access your local community.' : 'Become a verified member of your Cebuano neighborhood.'}
            </p>
          </div>

          {error && (
            <div className={`mb-10 p-6 rounded-[1.8rem] flex items-center gap-4 animate-slide-up border-2 ${error.includes('Success') ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${error.includes('Success') ? 'bg-green-100' : 'bg-red-100'}`}>
                {lockoutTime ? <Timer size={24} className="animate-pulse" /> : (error.includes('Success') ? <ShieldCheck size={24} /> : <X size={24} />)}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold uppercase tracking-wider leading-snug">{error}</p>
                {lockoutTime && (
                  <div className="w-full bg-red-200 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 120) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className={`space-y-5 transition-opacity duration-500 ${lockoutTime ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {!isLogin && (
              <>
                <div className="relative group">
                  <User className="absolute left-7 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-600 transition-all duration-300" size={20} />
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f3f5f7] dark:bg-zinc-900/50 border-2 border-transparent focus:border-primary-600/10 focus:bg-white dark:focus:bg-zinc-900 rounded-[1.5rem] py-[1.375rem] pl-[4.5rem] pr-6 text-[16px] font-bold outline-none transition-all text-main placeholder:text-muted/60"
                  />
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-7 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-600 transition-all duration-300" size={20} />
                  <input
                    required
                    type="text"
                    placeholder="Search Neighborhood"
                    value={searchTerm}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                      setNeighborhood('');
                    }}
                    className="w-full bg-[#f3f5f7] dark:bg-zinc-900/50 border-2 border-transparent focus:border-primary-600/10 focus:bg-white dark:focus:bg-zinc-900 rounded-[1.5rem] py-[1.375rem] pl-[4.5rem] pr-6 text-[16px] font-bold outline-none transition-all text-main placeholder:text-muted/60"
                  />

                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full mt-3 max-h-64 overflow-y-auto bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-2xl z-50 p-3 no-scrollbar animate-slide-up">
                      {filteredZones.map(z => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => {
                            setNeighborhood(z);
                            setSearchTerm(z);
                            setShowSuggestions(false);
                          }}
                          className={`w-full text-left px-5 py-4.5 rounded-2xl transition-all flex items-center gap-4 mb-1 ${neighborhood === z ? 'bg-primary-600 text-white shadow-xl' : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-main'}`}
                        >
                          <MapPin size={16} />
                          <span className="text-[13px] font-black uppercase tracking-widest">{z}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="relative group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-600 transition-all duration-300" size={20} />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f3f5f7] dark:bg-zinc-900/50 border-2 border-transparent focus:border-primary-600/10 focus:bg-white dark:focus:bg-zinc-900 rounded-[1.5rem] py-[1.375rem] pl-[4.5rem] pr-6 text-[16px] font-bold outline-none transition-all text-main placeholder:text-muted/60"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-600 transition-all duration-300" size={20} />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f3f5f7] dark:bg-zinc-900/50 border-2 border-transparent focus:border-primary-600/10 focus:bg-white dark:focus:bg-zinc-900 rounded-[1.5rem] py-[1.375rem] pl-[4.5rem] pr-16 text-[16px] font-bold outline-none transition-all text-main placeholder:text-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-primary-600 p-2 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative group animate-slide-up">
                <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-600 transition-all duration-300" size={20} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f3f5f7] dark:bg-zinc-900/50 border-2 border-transparent focus:border-primary-600/10 focus:bg-white dark:focus:bg-zinc-900 rounded-[1.5rem] py-[1.375rem] pl-[4.5rem] pr-16 text-[16px] font-bold outline-none transition-all text-main placeholder:text-muted/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-primary-600 p-2 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-6 rounded-[1.8rem] font-black text-[14px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:bg-primary-700 hover:translate-y-[-2px] transition-all active:scale-[0.98] flex items-center justify-center gap-4 mt-10 group"
            >
              {loading ? (
                <Loader2 size={26} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Join Now'}</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-14 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="group text-[12px] font-black uppercase text-muted hover:text-main transition-colors tracking-[0.25em] relative pb-2"
            >
              {isLogin ? "New here? Create Account" : "Joined before? Sign In"}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-100 dark:bg-zinc-800 group-hover:bg-primary-600 transition-colors"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
