'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, MapPin, Zap, ChevronDown } from 'lucide-react';
import { CEBU_ZONES } from '../lib/constants';

export default function Auth({ onAuthComplete }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredZones = CEBU_ZONES.filter(z =>
    z.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Sign Up
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

        if (signUpError) {
            if (signUpError.status === 429) {
                throw new Error("Too many registration attempts. Please wait a while before trying again or try logging in.");
            }
            throw signUpError;
        }

        // If email confirmation is on, Supabase might not return a session immediately
        if (data?.user && !data?.session) {
            setError("Success! Please check your email for a confirmation link to complete registration.");
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 p-8 sm:p-10 shadow-2xl transition-all my-8">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic text-3xl shadow-xl shadow-blue-200 mx-auto mb-4">C</div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">CebSocial</h2>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Local. Reliable. Cebuano.</p>
        </div>

        {error && (
            <div className={`text-[10px] font-black uppercase p-4 rounded-2xl mb-6 border animate-shake ${error.includes('Success') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {error}
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all dark:text-slate-200"
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        required
                        type="text"
                        placeholder="Search Neighborhood (e.g. Lahug)"
                        value={searchTerm}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                            setNeighborhood('');
                        }}
                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-12 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all dark:text-slate-200"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => { setSearchTerm(''); setNeighborhood(''); setShowSuggestions(true); }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {showSuggestions && (
                        <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl z-[100] p-3 scrollbar-thin scrollbar-thumb-gray-200">
                            <p className="text-[8px] font-black uppercase text-blue-500 tracking-[0.2em] mb-2 px-2 sticky top-0 bg-white dark:bg-slate-900 py-1">
                                {searchTerm ? `Results for "${searchTerm}"` : 'All Neighborhoods (Scroll down)'}
                            </p>
                            {filteredZones.length > 0 ? (
                                filteredZones.map(z => (
                                    <button
                                        key={z}
                                        type="button"
                                        onClick={() => {
                                            setNeighborhood(z);
                                            setSearchTerm(z);
                                            setShowSuggestions(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center space-x-3 mb-1 ${neighborhood === z ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'}`}
                                    >
                                        <MapPin size={12} className={neighborhood === z ? 'text-white' : 'text-blue-500'} />
                                        <span className="text-xs font-bold">{z}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-black uppercase text-gray-400">Area not found</p>
                                    <button onClick={() => setSearchTerm('')} className="text-[9px] font-bold text-blue-600 uppercase mt-2 underline">Show all areas</button>
                                </div>
                            )}
                        </div>
                    )}
                    {neighborhood && !showSuggestions && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-bounce-in">
                            <Zap size={16} fill="currentColor" />
                        </div>
                    )}
                </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all dark:text-slate-200"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all dark:text-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} fill="currentColor"/> <span>{isLogin ? 'Sign In' : 'Create Account'}</span></>}
          </button>
        </form>

        <div className="mt-8 text-center">
            <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black uppercase text-gray-400 hover:text-blue-600 transition-colors tracking-widest"
            >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>

      <p className="mt-8 text-[9px] font-black uppercase text-gray-400 tracking-[0.3em]">Cebu City Hyperlocal Social Network</p>
    </div>
  );
}
