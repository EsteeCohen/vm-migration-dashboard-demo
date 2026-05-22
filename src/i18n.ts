type Language = 'en' | 'he';

const strings: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.providers': 'Providers',
    'nav.plans': 'Migration Plans',
    'nav.cluster': 'Cluster',
    'nav.about': 'About',
    'dashboard.title': 'Dashboard',
    'dashboard.totalPlans': 'Total Plans',
    'dashboard.running': 'Running',
    'dashboard.completed': 'Completed',
    'dashboard.failed': 'Failed',
    'plan.create.title': 'Create Migration Plan',
    'plan.status.draft': 'Draft',
    'plan.status.ready': 'Ready',
    'plan.status.running': 'Running',
    'plan.status.succeeded': 'Succeeded',
    'plan.status.failed': 'Failed',
    'provider.status.ready': 'Ready',
    'provider.status.error': 'Error',
    'provider.status.critical': 'Critical',
    'provider.status.unknown': 'Unknown',
    'action.startMigration': 'Start Migration',
    'action.createPlan': 'Create Plan',
    'action.addProvider': 'Add Provider',
    'emptyState.noPlans': 'No migration plans yet',
    'emptyState.noProviders': 'No providers configured',
    'emptyState.noPlansBody': 'Create your first migration plan to get started.',
    'emptyState.noProvidersBody': 'Add a source and target provider to begin migrating VMs.',
  },
  he: {
    'nav.dashboard': 'לוח בקרה',
    'nav.providers': 'ספקים',
    'nav.plans': 'תוכניות הגירה',
    'nav.cluster': 'אשכול',
    'nav.about': 'אודות',
    'dashboard.title': 'לוח בקרה',
    'dashboard.totalPlans': 'סה"כ תוכניות',
    'dashboard.running': 'בתהליך',
    'dashboard.completed': 'הושלם',
    'dashboard.failed': 'נכשל',
    'plan.create.title': 'יצירת תוכנית הגירה',
    'plan.status.draft': 'טיוטה',
    'plan.status.ready': 'מוכן',
    'plan.status.running': 'בתהליך',
    'plan.status.succeeded': 'הצליח',
    'plan.status.failed': 'נכשל',
    'provider.status.ready': 'מוכן',
    'provider.status.error': 'שגיאה',
    'provider.status.critical': 'קריטי',
    'provider.status.unknown': 'לא ידוע',
    'action.startMigration': 'התחל הגירה',
    'action.createPlan': 'צור תוכנית',
    'action.addProvider': 'הוסף ספק',
    'emptyState.noPlans': 'אין תוכניות הגירה עדיין',
    'emptyState.noProviders': 'לא קיימים ספקים מוגדרים',
    'emptyState.noPlansBody': 'צור את תוכנית ההגירה הראשונה שלך כדי להתחיל.',
    'emptyState.noProvidersBody': 'הוסף ספק מקור וספק יעד כדי להתחיל בהגרת מכונות וירטואליות.',
  },
};

let currentLanguage: Language = (() => {
  try {
    const stored = localStorage.getItem('language') as Language | null;
    return stored && (stored === 'en' || stored === 'he') ? stored : 'en';
  } catch {
    return 'en';
  }
})();

export function t(key: string): string {
  return strings[currentLanguage][key] ?? key;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  try {
    localStorage.setItem('language', lang);
  } catch {
    // ignore
  }
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
}

if (typeof window !== 'undefined') {
  setLanguage(currentLanguage);
}