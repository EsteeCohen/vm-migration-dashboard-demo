import {
  PageSection,
  Title,
  Card,
  CardTitle,
  CardBody,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Content,
} from '@patternfly/react-core';
import {
  LaptopIcon,
  CloudIcon,
  DatabaseIcon,
  ServerIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  UserIcon,
  StarIcon,
  OutlinedQuestionCircleIcon,
  BookIcon,
} from '@patternfly/react-icons';
import { useLanguage } from '../context/LanguageContext';

// ── colour palette ──────────────────────────────────────────
const C = {
  browser:  { border: '#0066cc', bg: '#0066cc18', text: '#0066cc' },
  frontend: { border: '#6cb33e', bg: '#6cb33e18', text: '#4a8a2a' },
  backend:  { border: '#ee0000', bg: '#ee000012', text: '#cc0000' },
  db:       { border: '#f0ab00', bg: '#f0ab0018', text: '#c47800' },
  cloud:    { border: '#8b5cf6', bg: '#8b5cf612', text: '#7c3aed' },
  mock:     { border: '#9ca3af', bg: '#9ca3af12', text: '#6b7280' },
};

// ── small building blocks ───────────────────────────────────
function Node({
  icon, label, sub, scheme, width = 120,
}: {
  icon: React.ReactNode; label: string; sub?: string;
  scheme: typeof C[keyof typeof C]; width?: number;
}) {
  return (
    <div style={{
      border: `2px solid ${scheme.border}`,
      borderRadius: 10,
      padding: '10px 14px',
      background: scheme.bg,
      textAlign: 'center',
      width,
      minWidth: width,
      flexShrink: 0,
    }}>
      <div style={{ color: scheme.text, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: scheme.text }}>{label}</div>
      {sub && <div style={{ fontSize: '0.68rem', color: 'var(--pf-v6-global--Color--200)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function HArrow({ label }: { label?: string }) {
  return (
    <Flex
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentCenter' }}
      style={{ gap: 2, flexShrink: 0 }}
    >
      {label && <span style={{ fontSize: '0.62rem', color: 'var(--pf-v6-global--Color--200)', whiteSpace: 'nowrap' }}>{label}</span>}
      <ArrowRightIcon style={{ color: 'var(--pf-v6-global--Color--200)', fontSize: '0.9rem' }} />
    </Flex>
  );
}

function VArrow({ label }: { label?: string }) {
  return (
    <Flex
      direction={{ default: 'row' }}
      alignItems={{ default: 'alignItemsCenter' }}
      style={{ gap: 4, paddingInlineStart: 16, marginBlock: 2 }}
    >
      <ArrowDownIcon style={{ color: 'var(--pf-v6-global--Color--200)', fontSize: '0.8rem' }} />
      {label && <span style={{ fontSize: '0.62rem', color: 'var(--pf-v6-global--Color--200)' }}>{label}</span>}
    </Flex>
  );
}

function FlowRow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      style={{ gap: 8, flexWrap: 'nowrap', overflowX: 'auto', paddingBlock: 4, ...style }}
    >
      {children}
    </Flex>
  );
}

function ScenarioBadge({ ok, label }: { ok: 'yes' | 'warn' | 'no'; label: string }) {
  const map = {
    yes:  { icon: <CheckCircleIcon />,         color: 'var(--pf-v6-global--success-color--100)' },
    warn: { icon: <ExclamationTriangleIcon />, color: 'var(--pf-v6-global--warning-color--100)' },
    no:   { icon: <ExclamationTriangleIcon />, color: 'var(--pf-v6-global--danger-color--100)' },
  };
  const { icon, color } = map[ok];
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 6, color }}>
      {icon}
      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
    </Flex>
  );
}

// ── main page ───────────────────────────────────────────────
export function AboutPage() {
  const { language } = useLanguage();
  const he = language === 'he';

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="xl">
          {he ? 'איך הפרויקט עובד' : 'How This Project Works'}
        </Title>
        <Content component="p" style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>
          {he
            ? 'תרשים זרימה של הארכיטקטורה לכל תרחיש הפעלה'
            : 'Architecture flow diagram for every run scenario'}
        </Content>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>

          {/* ── Scenario 1 : npm run dev ──────────────────── */}
          <GridItem span={12}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 10 }}>
                  <InProgressIcon color="var(--pf-v6-global--info-color--100)" />
                  <span>
                    {he ? 'תרחיש 1 — פיתוח מקומי' : 'Scenario 1 — Local Development'}
                    <code style={{ fontSize: '0.8rem', marginInlineStart: 8, opacity: 0.7 }}>npm run dev</code>
                  </span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 0 }}>

                  {/* main flow */}
                  <FlowRow>
                    <Node icon={<LaptopIcon />} label={he ? 'דפדפן' : 'Browser'} sub="localhost:5173" scheme={C.browser} />
                    <HArrow label={he ? 'בקשת HTTP' : 'HTTP request'} />
                    <Node icon={<ServerIcon />} label="Vite" sub={he ? 'שרת פיתוח' : 'Dev Server :5173'} scheme={C.frontend} />
                    <HArrow label="/api/* proxy" />
                    <Node icon={<ServerIcon />} label="Express" sub="localhost:3001" scheme={C.backend} />
                    <HArrow label={he ? 'קריאה/כתיבה' : 'read/write'} />
                    <Node icon={<DatabaseIcon />} label="lowdb" sub=".db/db.json" scheme={C.db} />
                  </FlowRow>

                  {/* SSE branch */}
                  <VArrow label={he ? 'SSE — התקדמות הגירה' : 'SSE — migration progress'} />
                  <FlowRow style={{ marginInlineStart: 24 }}>
                    <Node icon={<LaptopIcon />} label="EventSource" sub={he ? 'מנוי אירועים' : 'browser subscription'} scheme={C.browser} width={140} />
                    <HArrow label={he ? 'אירועי JSON' : 'JSON events'} />
                    <Node icon={<ServerIcon />} label="/api/plans/:id/events" sub={he ? 'סימולציית SSE' : 'SSE simulation'} scheme={C.backend} width={180} />
                  </FlowRow>

                  <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <ScenarioBadge ok="yes" label={he ? 'נתונים נשמרים לדיסק' : 'Data saved to disk'} />
                    <ScenarioBadge ok="yes" label={he ? 'שרידות בין רענוני דף' : 'Survives page refresh'} />
                    <ScenarioBadge ok="yes" label={he ? 'SSE פעיל' : 'SSE live updates'} />
                    <ScenarioBadge ok="yes" label={he ? 'YAML ייצוא עובד' : 'YAML export works'} />
                  </div>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* ── Scenario 2 : Vercel frontend-only ────────── */}
          <GridItem md={6}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 10 }}>
                  <ExclamationTriangleIcon color="var(--pf-v6-global--warning-color--100)" />
                  <span>
                    {he ? 'תרחיש 2 — Vercel בלבד (ללא Backend)' : 'Scenario 2 — Vercel Frontend Only'}
                  </span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 0 }}>
                  <FlowRow>
                    <Node icon={<LaptopIcon />} label={he ? 'דפדפן' : 'Browser'} scheme={C.browser} />
                    <HArrow label="HTTPS" />
                    <Node icon={<CloudIcon />} label="Vercel CDN" sub="your-app.vercel.app" scheme={C.cloud} width={140} />
                    <HArrow label={he ? 'טוען' : 'serves'} />
                    <Node icon={<ServerIcon />} label="React App" sub="static build" scheme={C.frontend} />
                  </FlowRow>

                  <VArrow label={he ? 'קריאה ל-/api — נכשלת (אין שרת)' : '/api call — fails (no server)'} />

                  <FlowRow style={{ marginInlineStart: 24 }}>
                    <Node icon={<DatabaseIcon />} label={he ? 'Mock Data' : 'Mock Data'} sub={he ? 'בזיכרון בלבד' : 'in-memory only'} scheme={C.mock} />
                    <HArrow label={he ? 'fallback אוטומטי' : 'auto fallback'} />
                    <Node icon={<ServerIcon />} label="MigrationContext" sub="catch → mock" scheme={C.frontend} width={150} />
                  </FlowRow>

                  <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <ScenarioBadge ok="warn" label={he ? 'מוק דאטה בלבד' : 'Mock data only'} />
                    <ScenarioBadge ok="no"   label={he ? 'נתונים לא נשמרים' : 'No persistence'} />
                    <ScenarioBadge ok="no"   label={he ? 'SSE לא עובד' : 'No SSE'} />
                    <ScenarioBadge ok="yes"  label={he ? 'UI עובד מלא' : 'Full UI works'} />
                  </div>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* ── Scenario 3 : Vercel + Railway ────────────── */}
          <GridItem md={6}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 10 }}>
                  <CheckCircleIcon color="var(--pf-v6-global--success-color--100)" />
                  <span>
                    {he ? 'תרחיש 3 — Vercel + Railway (Full Stack)' : 'Scenario 3 — Vercel + Railway (Full Stack)'}
                  </span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 0 }}>
                  <FlowRow>
                    <Node icon={<LaptopIcon />} label={he ? 'דפדפן' : 'Browser'} scheme={C.browser} />
                    <HArrow label="HTTPS" />
                    <Node icon={<CloudIcon />} label="Vercel" sub="frontend" scheme={C.cloud} />
                    <HArrow label="HTTPS /api" />
                    <Node icon={<CloudIcon />} label="Railway" sub="Express :3001" scheme={C.backend} />
                    <HArrow />
                    <Node icon={<DatabaseIcon />} label="lowdb" sub=".db/db.json" scheme={C.db} />
                  </FlowRow>

                  <VArrow label={he ? 'SSE דרך Railway' : 'SSE via Railway'} />
                  <FlowRow style={{ marginInlineStart: 24 }}>
                    <Node icon={<LaptopIcon />} label="EventSource" scheme={C.browser} />
                    <HArrow label={he ? 'אירועים חיים' : 'live events'} />
                    <Node icon={<CloudIcon />} label="Railway SSE" scheme={C.backend} width={130} />
                  </FlowRow>

                  <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <ScenarioBadge ok="yes" label={he ? 'נתונים נשמרים' : 'Data persists'} />
                    <ScenarioBadge ok="yes" label={he ? 'SSE פעיל' : 'SSE live updates'} />
                    <ScenarioBadge ok="yes" label={he ? 'גישה מכל מקום' : 'Accessible anywhere'} />
                  </div>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* ── Data flow detail ──────────────────────────── */}
          <GridItem span={12}>
            <Card>
              <CardTitle>
                {he ? 'זרימת נתונים — יצירת תוכנית הגירה' : 'Data Flow — Creating a Migration Plan'}
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 0 }}>
                  <FlowRow>
                    <Node icon={<LaptopIcon />} label={he ? 'משתמש' : 'User'} sub={he ? 'ממלא אשף' : 'fills wizard'} scheme={C.browser} />
                    <HArrow label="POST /api/plans" />
                    <Node icon={<ServerIcon />} label="Express" sub={he ? 'ולידציה' : 'validates'} scheme={C.backend} />
                    <HArrow label={he ? 'כותב' : 'writes'} />
                    <Node icon={<DatabaseIcon />} label="db.json" sub={he ? 'שומר' : 'persisted'} scheme={C.db} />
                    <HArrow label="201 Created" />
                    <Node icon={<ServerIcon />} label="MigrationContext" sub={he ? 'מעדכן state' : 'updates state'} scheme={C.frontend} width={150} />
                    <HArrow label={he ? 'מרנדר מחדש' : 're-renders'} />
                    <Node icon={<LaptopIcon />} label={he ? 'דפדפן' : 'Browser'} sub={he ? 'רשימת תוכניות' : 'plans list'} scheme={C.browser} />
                  </FlowRow>

                  <div style={{ marginTop: 16 }}>
                    <FlowRow>
                      <Node icon={<LaptopIcon />} label={he ? 'לחיצת Start' : 'Start click'} scheme={C.browser} />
                      <HArrow label="PUT /api/plans/:id" />
                      <Node icon={<ServerIcon />} label="Express" sub={he ? 'status→running' : 'status→running'} scheme={C.backend} />
                      <HArrow label={he ? 'מאזין ל-SSE' : 'subscribes SSE'} />
                      <Node icon={<LaptopIcon />} label="EventSource" sub={he ? '% התקדמות' : 'progress %'} scheme={C.browser} />
                      <HArrow label={he ? 'בסוף' : 'on complete'} />
                      <Node icon={<DatabaseIcon />} label="db.json" sub={he ? 'succeeded' : 'succeeded'} scheme={C.db} />
                    </FlowRow>
                  </div>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* ── Tech legend ───────────────────────────────── */}
          <GridItem span={12}>
            <Card>
              <CardTitle>{he ? 'מקרא וטכנולוגיות' : 'Legend & Tech Stack'}</CardTitle>
              <CardBody>
                <Grid hasGutter sm={12} md={6} lg={3}>
                  {[
                    { scheme: C.browser,  label: he ? 'דפדפן / Client' : 'Browser / Client',     tech: 'React 19 + TypeScript' },
                    { scheme: C.frontend, label: he ? 'שרת Frontend' : 'Frontend Server',        tech: 'Vite / Vercel CDN, PatternFly 6' },
                    { scheme: C.backend,  label: he ? 'שרת Backend' : 'Backend Server',          tech: 'Node.js + Express 5' },
                    { scheme: C.db,       label: he ? 'בסיס נתונים' : 'Database',               tech: 'lowdb (JSON file, .db/db.json)' },
                  ].map(({ scheme, label, tech }) => (
                    <GridItem key={label}>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 10 }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: `2px solid ${scheme.border}`,
                          background: scheme.bg,
                          flexShrink: 0,
                        }} />
                        <FlexItem grow={{ default: 'grow' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{label}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--pf-v6-global--Color--200)' }}>{tech}</div>
                        </FlexItem>
                      </Flex>
                    </GridItem>
                  ))}
                </Grid>
              </CardBody>
            </Card>
          </GridItem>

        </Grid>
      </PageSection>

      {/* ── Why / Who / Good / How ────────────────────────── */}
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>

          {/* Why I built this */}
          <GridItem md={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 8 }}>
                  <BookIcon color="var(--pf-v6-global--info-color--100)" />
                  <span>{he ? 'למה יצרתי את הפרויקט הזה' : 'Why I Built This'}</span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 10 }}>
                  <Content component="p">
                    {he
                      ? 'רציתי לבנות פרויקט Full-Stack אמיתי. לא עוד TODO app.'
                      : 'I wanted to build something I could actually be proud to show. Not another TODO list.'}
                  </Content>
                  <Content component="p">
                    {he
                      ? 'בחרתי בנושא הגירת מכונות וירטואליות כי יש בו מורכבות אמיתית: ספקים שונים, סטטוסים שמשתנים, עדכונים בזמן אמת, ייצוא ל-Kubernetes. הסוג של בעיות שקיים במוצרים אמיתיים.'
                      : 'VM migration felt like the right domain. There are multiple providers, changing statuses, live progress updates, Kubernetes YAML export. Real problems you find in real products.'}
                  </Content>
                  <Content component="p">
                    {he
                      ? 'המטרה הייתה ללמוד תוך כדי עשייה: React עם TypeScript, שרת Express עם SSE, PatternFly, עברית ואנגלית עם RTL, נגישות, CI/CD ובדיקות. הכל בפרויקט אחד שמחזיק הגיון.'
                      : 'The goal was to learn by building: React with TypeScript the right way, an Express backend with SSE, PatternFly, Hebrew/English with RTL, accessibility, CI/CD, and tests. All in one project that actually hangs together.'}
                  </Content>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* Who it's for */}
          <GridItem md={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 8 }}>
                  <UserIcon color="var(--pf-v6-global--info-color--100)" />
                  <span>{he ? 'למי הפרויקט מיועד' : "Who It's For"}</span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 8 }}>
                  {[
                    {
                      title: he ? 'מפתחים שרוצים ללמוד Full-Stack' : 'Developers learning full-stack',
                      body: he
                        ? 'הקוד פתוח וקריא. אפשר לראות בדיוק איך frontend מתחבר ל-backend, איך SSE עובד בפועל, ואיך מנהלים state מורכב עם React Context.'
                        : 'The code is open and readable. You can see exactly how the frontend connects to the backend, how SSE works in practice, and how to manage complex state with React Context.',
                    },
                    {
                      title: he ? 'מי שרוצה לראות PatternFly בפעולה' : 'Anyone exploring PatternFly',
                      body: he
                        ? 'PatternFly 6 היא מערכת העיצוב של Red Hat לאפליקציות ארגוניות. הפרויקט מכסה הרבה ממנה: Page layout, Nav, Tables, Charts, Wizards, Alerts ו-Badges.'
                        : 'PatternFly 6 is Red Hat\'s design system for enterprise apps. This project covers a lot of it: Page layout, Nav, Tables, Charts, Wizards, Alerts, Badges.',
                    },
                    {
                      title: he ? 'מהנדסים שמתעניינים בהגירת ענן' : 'Engineers curious about cloud migration',
                      body: he
                        ? 'הדמו עובר על המושגים: מה זה ספקי מקור ויעד, מה ההבדל בין VMware ל-KubeVirt, ומה Forklift עושה בסביבת OpenShift.'
                        : 'The demo walks through the concepts: what source and target providers are, how VMware differs from KubeVirt, and what Forklift does in an OpenShift environment.',
                    },
                  ].map(({ title, body }) => (
                    <div key={title} style={{
                      borderInlineStart: '3px solid var(--pf-v6-global--info-color--100)',
                      paddingInlineStart: 12,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--pf-v6-global--Color--200)' }}>{body}</div>
                    </div>
                  ))}
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* Why it's good */}
          <GridItem md={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 8 }}>
                  <StarIcon color="var(--pf-v6-global--warning-color--100)" />
                  <span>{he ? 'מה הופך אותו לטוב' : 'What Makes It Good'}</span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 6 }}>
                  {[
                    {
                      emoji: '🗄️',
                      label: he ? 'Backend אמיתי' : 'Real backend',
                      desc: he
                        ? 'שרת Express עם REST API ובסיס נתונים JSON שכותב לדיסק. לא סתם mock.'
                        : 'Express server, REST API, JSON database written to disk. Not mocked.',
                    },
                    {
                      emoji: '📡',
                      label: he ? 'זמן אמת' : 'Real-time updates',
                      desc: he
                        ? 'Server-Sent Events לעדכוני התקדמות הגירה. אותו מנגנון שמוצרים אמיתיים משתמשים בו.'
                        : 'Server-Sent Events for live migration progress. Same mechanism real products use.',
                    },
                    {
                      emoji: '🌐',
                      label: he ? 'עברית ואנגלית מלא' : 'Full Hebrew/English',
                      desc: he
                        ? 'RTL, localStorage persistence, ו-key remount לעדכון מיידי של כל הדפים.'
                        : 'RTL, localStorage persistence, key-based remount so every page updates instantly.',
                    },
                    {
                      emoji: '♿',
                      label: he ? 'נגישות' : 'Accessibility',
                      desc: he
                        ? 'Skip links, ARIA labels, ניהול פוקוס ותאימות לקורא מסך.'
                        : 'Skip links, ARIA labels, focus management, screen-reader support.',
                    },
                    {
                      emoji: '🧪',
                      label: he ? 'בדיקות וCI' : 'Tests and CI',
                      desc: he
                        ? '16 בדיקות עם Vitest ו-RTL, E2E עם Playwright, ו-GitHub Actions שרץ על כל push.'
                        : '16 tests with Vitest and RTL, E2E with Playwright, GitHub Actions on every push.',
                    },
                    {
                      emoji: '📋',
                      label: he ? 'ייצוא Kubernetes' : 'Kubernetes export',
                      desc: he
                        ? 'ייצוא YAML בפורמט Forklift CRD אמיתי שאפשר להשתמש בו על OpenShift.'
                        : 'YAML export in real Forklift CRD format, usable on actual OpenShift clusters.',
                    },
                  ].map(({ emoji, label, desc }) => (
                    <Flex key={label} alignItems={{ default: 'alignItemsFlexStart' }} style={{ gap: 10 }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                      <FlexItem grow={{ default: 'grow' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{label}: </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--pf-v6-global--Color--200)' }}>{desc}</span>
                      </FlexItem>
                    </Flex>
                  ))}
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* How to use it */}
          <GridItem md={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ gap: 8 }}>
                  <OutlinedQuestionCircleIcon color="var(--pf-v6-global--success-color--100)" />
                  <span>{he ? 'איך להשתמש בפרויקט' : 'How to Use It'}</span>
                </Flex>
              </CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} style={{ gap: 10 }}>
                  {[
                    {
                      step: '01',
                      title: he ? 'הפעלה מקומית' : 'Run locally',
                      body: he
                        ? 'Clone, npm install, ואז npm run dev. שני שרתים עולים ביחד: Vite על 5173: ו-Express על 3001:.'
                        : 'Clone, npm install, then npm run dev. Two servers start together: Vite on :5173 and Express on :3001.',
                      code: 'git clone ... && npm install && npm run dev',
                    },
                    {
                      step: '02',
                      title: he ? 'חקור את הספקים' : 'Explore providers',
                      body: he
                        ? 'עבור לדף Providers. יש שם 6 ספקים מדומים: VMware, oVirt, OpenStack, OpenShift. אלו הנקודות שממנן ואליהן מגרים מכונות.'
                        : 'Go to Providers. There are 6 simulated providers: VMware, oVirt, OpenStack, OpenShift. These are the endpoints you migrate between.',
                    },
                    {
                      step: '03',
                      title: he ? 'צור תוכנית הגירה' : 'Create a migration plan',
                      body: he
                        ? 'Plans ולאחר מכן Create Plan. יש אשף בן 5 שלבים: שם, ספקים, מיפוי רשת, מיפוי אחסון, סיכום.'
                        : 'Plans then Create Plan. A 5-step wizard walks you through: name, providers, network mapping, storage mapping, review.',
                    },
                    {
                      step: '04',
                      title: he ? 'הפעל הגירה וצפה בהתקדמות' : 'Start migration and watch progress',
                      body: he
                        ? 'לחץ Start Migration על תוכנית מוכנה. הסטטוס ישתנה ל-Running ופס ההתקדמות יתעדכן בזמן אמת.'
                        : 'Click Start Migration on a ready plan. Status changes to Running and the progress bar updates live.',
                    },
                    {
                      step: '05',
                      title: he ? 'נסה את שאר הפיצ\'רים' : "Try the rest",
                      body: he
                        ? 'ייצא תוכנית כ-YAML, עבור לדף Cluster לראות מכונות KubeVirt, החלף שפה, החלף מצב כהה, ובדוק את הגרפים בדשבורד.'
                        : 'Export a plan as YAML, visit the Cluster page for KubeVirt VMs, switch language, toggle dark mode, check the dashboard charts.',
                    },
                  ].map(({ step, title, body, code }) => (
                    <Flex key={step} alignItems={{ default: 'alignItemsFlexStart' }} style={{ gap: 12 }}>
                      <div style={{
                        background: 'var(--pf-v6-global--primary-color--100)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700,
                        flexShrink: 0, marginTop: 2,
                      }}>{step}</div>
                      <FlexItem grow={{ default: 'grow' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{title}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--pf-v6-global--Color--200)', marginBottom: code ? 4 : 0 }}>{body}</div>
                        {code && (
                          <code style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            background: 'var(--pf-v6-global--BackgroundColor--200)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontFamily: 'monospace',
                          }}>{code}</code>
                        )}
                      </FlexItem>
                    </Flex>
                  ))}
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

        </Grid>
      </PageSection>
    </>
  );
}
