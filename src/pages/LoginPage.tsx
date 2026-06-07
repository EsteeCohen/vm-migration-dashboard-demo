import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  Alert,
} from '@patternfly/react-core';
import type { CredentialResponse } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GOOGLE_CONFIGURED = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Hexagonal app logo
function AppLogo({ size = 36, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12 12L3 7M12 12v10M12 12l9-5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// Google "G" SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const { language } = useLanguage();
  const he = language === 'he';

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign-in state
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');

  // Sign-up state
  const [displayName, setDisplayName]       = useState('');
  const [newUsername, setNewUsername]       = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPass, setConfirmPass]       = useState('');

  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const go = () => navigate('/', { replace: true });

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) return;
    setBusy(true); setError('');
    try { await login(username, password); go(); }
    catch { setError(he ? 'שם משתמש או סיסמה שגויים' : 'Incorrect username or password'); }
    finally { setBusy(false); }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!displayName || !newUsername || !newPassword || !confirmPass) return;
    if (newPassword !== confirmPass) {
      setError(he ? 'הסיסמאות אינן תואמות' : 'Passwords do not match');
      return;
    }
    setBusy(true); setError('');
    try { await register(displayName, newUsername, newPassword); go(); }
    catch (err) {
      setError((err as Error).message || (he ? 'ההרשמה נכשלה' : 'Registration failed'));
    }
    finally { setBusy(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setBusy(true); setError('');
    try { await loginWithGoogle(credentialResponse.credential); go(); }
    catch { setError(he ? 'כניסת גוגל נכשלה' : 'Google sign-in failed'); }
    finally { setBusy(false); }
  };

  const fill = (u: string, p: string) => {
    setUsername(u); setPassword(p); setError(''); setTab('signin');
  };

  const switchTab = (t: 'signin' | 'signup') => {
    setTab(t); setError('');
  };

  const features = he ? [
    'ממשק REST API אמיתי עם Express ו-lowdb',
    'עדכוני התקדמות חיים דרך Server-Sent Events',
    'ייצוא YAML ל-Kubernetes תואם Forklift',
    'תמיכה בשני לשונות ובמצב כהה',
  ] : [
    'Real REST API backend with Express and lowdb',
    'Live migration progress via Server-Sent Events',
    'Kubernetes YAML export matching Forklift CRDs',
    'Hebrew/English i18n and dark mode support',
  ];

  const passwordMismatch = tab === 'signup' && confirmPass.length > 0 && newPassword !== confirmPass;

  return (
    <div className="login-layout" dir={he ? 'rtl' : 'ltr'}>

      {/* ── Left branding panel ───────────────────────────── */}
      <div className="login-brand-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <AppLogo size={40} color="rgba(255,255,255,0.9)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.01em' }}>
              {he ? 'ערכת הגירה' : 'Migration Toolkit'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              {he ? 'לוירטואליזציה' : 'for Virtualization'}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          {he
            ? 'העבר עומסי עבודה ממכונות וירטואליות ישנות לאשכולות Kubernetes — בצורה בטוחה ועם נראות מלאה.'
            : 'Move workloads from legacy virtual machines to Kubernetes clusters — safely, with full visibility.'}
        </p>

        <ul className="login-feature-list">
          {features.map((f) => (
            <li key={f}>
              <span style={{ color: '#4ec9b0', fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div style={{
          marginTop: 'auto',
          paddingTop: '2.5rem',
          fontSize: '0.73rem',
          color: 'rgba(255,255,255,0.3)',
        }}>
          {he ? 'מבוסס על' : 'Inspired by'} Red Hat MTV / Forklift
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className="login-form-panel">
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile-only header */}
          <div style={{ display: 'none' }} className="login-mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', justifyContent: 'center' }}>
              <AppLogo size={28} color="#0066cc" />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {he ? 'ערכת הגירה' : 'Migration Toolkit'}
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#151515', marginBottom: '0.3rem', marginTop: 0 }}>
            {tab === 'signin'
              ? (he ? 'כניסה לחשבון' : 'Welcome back')
              : (he ? 'יצירת חשבון' : 'Create an account')}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6a6e73', marginBottom: '1.5rem' }}>
            {tab === 'signin'
              ? (he ? 'הכנס את פרטיך כדי להמשיך' : 'Enter your credentials to continue')
              : (he ? 'כל חשבון חדש מקבל תפקיד DEMO' : 'New accounts get the DEMO role by default')}
          </p>

          {/* Tabs */}
          <div className="login-tabs" role="tablist">
            <button
              className={`login-tab-btn${tab === 'signin' ? ' active' : ''}`}
              role="tab"
              aria-selected={tab === 'signin'}
              onClick={() => switchTab('signin')}
            >
              {he ? 'כניסה' : 'Sign in'}
            </button>
            <button
              className={`login-tab-btn${tab === 'signup' ? ' active' : ''}`}
              role="tab"
              aria-selected={tab === 'signup'}
              onClick={() => switchTab('signup')}
            >
              {he ? 'הרשמה' : 'Sign up'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="danger" title={error} isInline style={{ marginBottom: '1rem' }} />
          )}

          {/* ── Sign-In form ─────────────────────────────── */}
          {tab === 'signin' && (
            <Form onSubmit={handleSignIn}>
              <FormGroup label={he ? 'שם משתמש' : 'Username'} fieldId="si-username" isRequired>
                <TextInput
                  id="si-username"
                  value={username}
                  onChange={(_e, v) => setUsername(v)}
                  autoComplete="username"
                  autoFocus
                />
              </FormGroup>
              <FormGroup label={he ? 'סיסמה' : 'Password'} fieldId="si-password" isRequired>
                <TextInput
                  id="si-password"
                  type="password"
                  value={password}
                  onChange={(_e, v) => setPassword(v)}
                  autoComplete="current-password"
                />
              </FormGroup>
              <Button
                type="submit"
                variant="primary"
                isLoading={busy}
                isDisabled={busy || !username || !password}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                {he ? 'כניסה' : 'Sign in'}
              </Button>
            </Form>
          )}

          {/* ── Sign-Up form ─────────────────────────────── */}
          {tab === 'signup' && (
            <Form onSubmit={handleSignUp}>
              <FormGroup label={he ? 'שם תצוגה' : 'Display name'} fieldId="su-name" isRequired>
                <TextInput
                  id="su-name"
                  value={displayName}
                  onChange={(_e, v) => setDisplayName(v)}
                  autoComplete="name"
                  autoFocus
                  placeholder={he ? 'למשל: ישראל ישראלי' : 'e.g. Jane Smith'}
                />
              </FormGroup>
              <FormGroup label={he ? 'שם משתמש' : 'Username'} fieldId="su-username" isRequired>
                <TextInput
                  id="su-username"
                  value={newUsername}
                  onChange={(_e, v) => setNewUsername(v)}
                  autoComplete="username"
                  placeholder={he ? 'אותיות ומספרים בלבד' : 'letters and numbers only'}
                />
              </FormGroup>
              <FormGroup label={he ? 'סיסמה' : 'Password'} fieldId="su-password" isRequired>
                <TextInput
                  id="su-password"
                  type="password"
                  value={newPassword}
                  onChange={(_e, v) => setNewPassword(v)}
                  autoComplete="new-password"
                />
              </FormGroup>
              <FormGroup label={he ? 'אימות סיסמה' : 'Confirm password'} fieldId="su-confirm" isRequired>
                <TextInput
                  id="su-confirm"
                  type="password"
                  value={confirmPass}
                  onChange={(_e, v) => setConfirmPass(v)}
                  autoComplete="new-password"
                  validated={passwordMismatch ? 'error' : 'default'}
                />
                {passwordMismatch && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="error">
                        {he ? 'הסיסמאות אינן תואמות' : 'Passwords do not match'}
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
              </FormGroup>
              <Button
                type="submit"
                variant="primary"
                isLoading={busy}
                isDisabled={busy || !displayName || !newUsername || !newPassword || !confirmPass || passwordMismatch}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                {he ? 'יצירת חשבון' : 'Create account'}
              </Button>
            </Form>
          )}

          {/* ── Divider ──────────────────────────────────── */}
          <div className="login-divider">
            {he ? 'או המשך עם' : 'or continue with'}
          </div>

          {/* ── Google button ────────────────────────────── */}
          {GOOGLE_CONFIGURED ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError(he ? 'כניסת גוגל נכשלה' : 'Google sign-in failed')}
                width={400}
                text="signin_with"
                shape="rectangular"
              />
            </div>
          ) : (
            <button
              className="google-btn"
              disabled
              title={he
                ? 'הגדר VITE_GOOGLE_CLIENT_ID ב-.env.local כדי להפעיל'
                : 'Set VITE_GOOGLE_CLIENT_ID in .env.local to enable'}
            >
              <GoogleIcon />
              <span>
                {he ? 'כניסה עם Google' : 'Sign in with Google'}
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#888', fontWeight: 400 }}>
                  {he ? '(דורש הגדרת VITE_GOOGLE_CLIENT_ID)' : '(requires VITE_GOOGLE_CLIENT_ID)'}
                </span>
              </span>
            </button>
          )}

          {/* ── Quick demo access ────────────────────────── */}
          <div className="login-quick-access">
            <div style={{ fontSize: '0.78rem', color: '#8a8d90', marginBottom: 10, textAlign: 'center' }}>
              {he ? 'כניסה מהירה לדמו:' : 'Quick demo access:'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                style={{ flex: 1, fontSize: '0.8rem' }}
                onClick={() => fill('demo', 'demo')}
              >
                DEMO
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.65, marginTop: 1 }}>
                  demo / demo
                </span>
              </Button>
              <Button
                variant="secondary"
                style={{ flex: 1, fontSize: '0.8rem' }}
                onClick={() => fill('admin', 'admin')}
              >
                ADMIN
                <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.65, marginTop: 1 }}>
                  admin / admin
                </span>
              </Button>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#8a8d90', textAlign: 'center' }}>
              {he
                ? 'DEMO: צפייה ויצירה  |  ADMIN: גישה מלאה כולל מחיקה'
                : 'DEMO: view and create  |  ADMIN: full access including delete'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
