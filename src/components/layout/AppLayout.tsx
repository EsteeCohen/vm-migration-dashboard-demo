import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Page,
  Masthead,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  MastheadToggle,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  Nav,
  NavList,
  NavItem,
  Button,
  AlertGroup,
  Alert,
  AlertActionCloseButton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Label,
} from '@patternfly/react-core';
import { MoonIcon, SunIcon, BarsIcon, GlobeIcon, SignOutAltIcon } from '@patternfly/react-icons';
import { useMigrations } from '../../hooks/useMigrations';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n';
import type { Toast } from '../../context/MigrationContext';

// Auto-dismissing toast — handles its own 10-second lifecycle with fade-out
function ToastAlert({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer   = setTimeout(() => setFading(true),  9500);
    const removeTimer = setTimeout(onRemove,                10000);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [onRemove]);

  return (
    <Alert
      variant={toast.variant}
      title={toast.title}
      className={fading ? 'toast-fading' : ''}
      actionClose={
        <AlertActionCloseButton
          title={toast.title}
          onClose={onRemove}
          aria-label={`Close ${toast.title} alert`}
        />
      }
    >
      {toast.body}
    </Alert>
  );
}

function closeMobileSidebar() {
  if (window.innerWidth < 1200) document.getElementById('nav-toggle')?.click();
}

export function AppLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { toasts, removeToast } = useMigrations();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('pf-v6-theme-dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const navItems = [
    { label: t('nav.dashboard'), path: '/' },
    { label: t('nav.providers'), path: '/providers' },
    { label: t('nav.plans'),     path: '/plans' },
    { label: t('nav.cluster'),   path: '/cluster' },
    { label: t('nav.about'),     path: '/about' },
  ];

  const masthead = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton variant="plain" aria-label="Global navigation" id="nav-toggle" isHamburgerButton>
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <path d="M12 12L3 7M12 12v10M12 12l9-5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>
            {language === 'he' ? 'ערכת הגירה' : 'Migration Toolkit'}
          </span>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar>
          <ToolbarContent>
            {/* Language toggle */}
            <ToolbarItem>
              <Button
                variant="plain"
                aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
                onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
              >
                <GlobeIcon aria-hidden="true" />
                <span style={{ marginInlineStart: '0.35rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  {language === 'en' ? 'EN' : 'HE'}
                </span>
              </Button>
            </ToolbarItem>

            {/* Dark mode */}
            <ToolbarItem>
              <Button
                variant="plain"
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                onClick={toggleTheme}
                icon={isDark ? <SunIcon /> : <MoonIcon />}
              />
            </ToolbarItem>

            {/* User + role */}
            {user && (
              <ToolbarItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.displayName}</span>
                  <Label
                    color={user.role === 'admin' ? 'red' : 'blue'}
                    isCompact
                  >
                    {user.role.toUpperCase()}
                  </Label>
                  <Button
                    variant="plain"
                    aria-label="Sign out"
                    onClick={handleLogout}
                    title={language === 'he' ? 'יציאה' : 'Sign out'}
                    icon={<SignOutAltIcon />}
                  />
                </div>
              </ToolbarItem>
            )}
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Nav aria-label="Primary navigation">
          <NavList>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                isActive={item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)}
                onClick={() => { closeMobileSidebar(); navigate(item.path); }}
                style={{ cursor: 'pointer' }}
              >
                {item.label}
              </NavItem>
            ))}
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <>
      <a
        href="#main-content"
        style={{ position: 'absolute', left: '-9999px', zIndex: 9999 }}
        onFocus={(e)  => { e.currentTarget.style.position = 'static'; e.currentTarget.style.left = 'auto'; }}
        onBlur={(e)   => { e.currentTarget.style.position = 'absolute'; e.currentTarget.style.left = '-9999px'; }}
      >
        {language === 'he' ? 'דלג לתוכן ראשי' : 'Skip to main content'}
      </a>
      <div id="main-content">
        <Page masthead={masthead} sidebar={sidebar} isManagedSidebar>
          <Outlet key={language} />
        </Page>
      </div>
      <AlertGroup isToast isLiveRegion>
        {toasts.map((toast) => (
          <ToastAlert key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AlertGroup>
    </>
  );
}
