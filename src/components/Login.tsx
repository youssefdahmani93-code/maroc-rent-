
import React, { useState } from 'react';
import { Car, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldAlert, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Security: Lockout logic
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Success is handled by AuthContext via onAuthStateChange
      setAttempts(0);
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setIsLoading(false);

      if (newAttempts >= 5) {
        setIsLocked(true);
        setError('Compte temporairement bloqué suite à trop de tentatives.');
      } else {
        setError(err.message || 'Email ou mot de passe incorrect.');
      }
    }
  };

  const handleQuickLogin = (emailToUse: string) => {
    setEmail(emailToUse);
    setPassword('123456');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;

      alert(`Si un compte existe pour ${email}, un email de réinitialisation a été envoyé.`);
      setForgotPasswordMode(false);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Brand/Image Section */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 relative overflow-hidden flex flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
              <Car className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">GoRent</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-md font-medium leading-relaxed">
            La solution professionnelle complète pour la gestion de votre agence de location de voitures au Maroc.
          </p>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>

        <div className="relative z-10 text-sm text-blue-200/80">
          © 2024 Go Rent Inc. Tous droits réservés.
        </div>
      </div>

      {/* Right: Form Section */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900">
              {forgotPasswordMode ? 'Réinitialisation' : 'Connexion'}
            </h2>
            <p className="mt-2 text-slate-600">
              {forgotPasswordMode
                ? "Entrez votre email pour recevoir un lien sécurisé."
                : "Accédez à votre espace de gestion sécurisé."}
            </p>
          </div>

          {error && (
            <div className={`border px-4 py-3 rounded-lg flex items-start gap-3 text-sm ${isLocked ? 'bg-red-100 border-red-200 text-red-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {isLocked ? <ShieldAlert className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <span>{error}</span>
            </div>
          )}

          {!forgotPasswordMode ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isLocked}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="nom@agence.ma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLocked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Remember me is handled by Supabase session persistence by default */}
                </div>

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setForgotPasswordMode(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-6 text-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3 text-orange-500" /> Connexion Rapide (Démo)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleQuickLogin('ahmed.tazi@gorent.ma')} className="flex flex-col items-start p-2 bg-white border border-slate-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-all group">
                    <span className="text-xs font-bold text-blue-700 group-hover:text-blue-800">Admin</span>
                    <span className="text-[10px] text-slate-500">Accès Complet</span>
                  </button>
                  <button type="button" onClick={() => handleQuickLogin('sara.id@gorent.ma')} className="flex flex-col items-start p-2 bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                    <span className="text-xs font-bold text-indigo-700 group-hover:text-indigo-800">Manager</span>
                    <span className="text-[10px] text-slate-500">Gestion Agence</span>
                  </button>
                  <button type="button" onClick={() => handleQuickLogin('agent@gorent.ma')} className="flex flex-col items-start p-2 bg-white border border-slate-200 rounded hover:bg-green-50 hover:border-green-200 transition-all group">
                    <span className="text-xs font-bold text-green-700 group-hover:text-green-800">Agent</span>
                    <span className="text-[10px] text-slate-500">Réservations</span>
                  </button>
                  <button type="button" onClick={() => handleQuickLogin('compta@gorent.ma')} className="flex flex-col items-start p-2 bg-white border border-slate-200 rounded hover:bg-yellow-50 hover:border-yellow-200 transition-all group">
                    <span className="text-xs font-bold text-yellow-700 group-hover:text-yellow-800">Comptable</span>
                    <span className="text-[10px] text-slate-500">Finances</span>
                  </button>
                </div>
                <div className="mt-2">
                  <button type="button" onClick={() => handleQuickLogin('tech@gorent.ma')} className="w-full flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded hover:bg-orange-50 hover:border-orange-200 transition-all group">
                    <span className="text-xs font-bold text-orange-700 group-hover:text-orange-800">Mécanicien</span>
                    <span className="text-[10px] text-slate-500">(Maintenance Flotte)</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="nom@agence.ma"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {isLoading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setForgotPasswordMode(false); setError(''); }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};