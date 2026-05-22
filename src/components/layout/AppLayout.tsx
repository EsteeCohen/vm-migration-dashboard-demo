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
  MenuToggle,
  Dropdown,
  DropdownList,
  DropdownItem,
} from '@patternfly/react-core';
import { MoonIcon, SunIcon, BarsIcon, GlobeIcon } from '@patternfly/react-icons';
import { useMigrations } from '../../hooks/useMigrations';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../i18n';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast } = useMigrations();
  const { language, setLanguage } = useLanguage();
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('pf-v6-theme-dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
  };

  const navItems = [
    { label: t('nav.dashboard'), path: '/' },
    { label: t('nav.providers'), path: '/providers' },
    { label: t('nav.plans'), path: '/plans' },
    { label: t('nav.cluster'), path: '/cluster' },
    { label: t('nav.about'), path: '/about' },
  ];

  const masthead = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label={language === 'he' ? 'ניווט גלובלי' : 'Global navigation'}
          id="nav-toggle"
          isHamburgerButton
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
            />
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
            <ToolbarItem>
              <Dropdown
                isOpen={langDropdownOpen}
                onOpenChange={setLangDropdownOpen}
                toggle={(ref) => (
                  <MenuToggle ref={ref} onClick={() => setLangDropdownOpen(!langDropdownOpen)}>
                    <GlobeIcon aria-hidden="true" />
                    <span style={{ marginLeft: '0.5rem' }}>{language.toUpperCase()}</span>
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}>
                    English
                  </DropdownItem>
                  <DropdownItem onClick={() => { setLanguage('he'); setLangDropdownOpen(false); }}>
                    עברית
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Button
                variant="plain"
                aria-label={isDark ? (language === 'he' ? 'עבור לערכת בהירה' : 'Switch to light theme') : (language === 'he' ? 'עבור לערכת אפלה' : 'Switch to dark theme')}
                onClick={toggleTheme}
                icon={isDark ? <SunIcon /> : <MoonIcon />}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Nav aria-label={language === 'he' ? 'ניווט ראשי' : 'Primary navigation'}>
          <NavList>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                isActive={
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)
                }
                onClick={() => navigate(item.path)}
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
      <a href="#main-content" style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
      }} onFocus={(e) => {
        e.currentTarget.style.position = 'static';
        e.currentTarget.style.left = 'auto';
      }} onBlur={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.left = '-9999px';
      }}>
        {language === 'he' ? 'דלג לתוכן ראשי' : 'Skip to main content'}
      </a>
      <Page masthead={masthead} sidebar={sidebar} isManagedSidebar>
        <main id="main-content">
          <Outlet />
        </main>
      </Page>
      <AlertGroup isToast isLiveRegion>
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variant={toast.variant}
            title={toast.title}
            actionClose={
              <AlertActionCloseButton
                title={toast.title}
                onClose={() => removeToast(toast.id)}
                aria-label={`Close ${toast.title} alert`}
              />
            }
          >
            {toast.body}
          </Alert>
        ))}
      </AlertGroup>
    </>
  );
}
