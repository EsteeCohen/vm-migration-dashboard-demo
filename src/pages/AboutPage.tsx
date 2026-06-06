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
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

export function AboutPage() {
  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="xl">About This Demo</Title>
        <Content component="p" style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>
          Understanding what's real and what's simulated in this dashboard.
        </Content>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem md={6}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <CheckCircleIcon color="var(--pf-v6-global--success-color--100)" />
                  <span>Real Functionality</span>
                </Flex>
              </CardTitle>
              <CardBody>
                <DescriptionList isCompact>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Backend Server</DescriptionListTerm>
                    <DescriptionListDescription>
                      Express.js server (running on localhost:3001) with real REST API and database persistence using lowdb.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Data Persistence</DescriptionListTerm>
                    <DescriptionListDescription>
                      All plans, providers, and VMs are stored in a real JSON database (.db/db.json). Changes persist
                      across page refreshes.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Create Migration Plans</DescriptionListTerm>
                    <DescriptionListDescription>
                      The 5-step wizard with validation, network mapping, and storage mapping is fully functional and
                      creates real plan objects in the database.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>i18n & Multi-language</DescriptionListTerm>
                    <DescriptionListDescription>
                      Full Hebrew and English support with persistent language selection. Toggle in the masthead.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Responsive Design</DescriptionListTerm>
                    <DescriptionListDescription>
                      PatternFly's isManagedSidebar + mobile hamburger menu work on all devices. Accessibility features
                      include skip links and ARIA labels.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>YAML Export</DescriptionListTerm>
                    <DescriptionListDescription>
                      Export migration plans as real Kubernetes Custom Resources (Forklift/MTV API format) for use with
                      the open-source migration toolkit.
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={6}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <ExclamationCircleIcon color="var(--pf-v6-global--warning-color--100)" />
                  <span>Simulated for Demo</span>
                </Flex>
              </CardTitle>
              <CardBody>
                <DescriptionList isCompact>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Live Migration Progress</DescriptionListTerm>
                    <DescriptionListDescription>
                      When you start a migration, the progress animation is simulated. In production, this would
                      stream from a real Forklift controller via Server-Sent Events (SSE).
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Provider Connections</DescriptionListTerm>
                    <DescriptionListDescription>
                      VMware, oVirt, OpenStack providers are mock data. Real providers require connectivity to actual
                      infrastructure APIs.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>VM Inventory</DescriptionListTerm>
                    <DescriptionListDescription>
                      The 20 VMs in the demo are seeded test data. Production would query live VM counts from each
                      provider's inventory service.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>KubeVirt Cluster View</DescriptionListTerm>
                    <DescriptionListDescription>
                      Shows simulated KubeVirt VMs and Kubernetes pods. A real cluster view would query live
                      VirtualMachine and Pod objects from a Kubernetes API.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Migration Log</DescriptionListTerm>
                    <DescriptionListDescription>
                      Log entries are synthetic. Real logs would come from Forklift/MTV controller logs showing actual
                      disk copy, validation, and cutover events.
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Provider Status</DescriptionListTerm>
                    <DescriptionListDescription>
                      Status badges are hardcoded. In production, status would reflect real connectivity and health
                      checks against each provider.
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <Card>
              <CardTitle>What's Next: Real Deployment</CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <strong>To connect this dashboard to real infrastructure:</strong>
                  </FlexItem>
                  <FlexItem>
                    <ol style={{ paddingLeft: '1.5rem' }}>
                      <li>
                        Deploy <a href="https://github.com/konveyor/forklift" target="_blank" rel="noopener noreferrer">
                          Forklift (MTV)
                        </a>{' '}
                        on a Kubernetes cluster (e.g., OpenShift Developer Sandbox)
                      </li>
                      <li>
                        Connect provider credentials (VMware vCenter, oVirt, OpenStack endpoints) via the Forklift UI or
                        API
                      </li>
                      <li>
                        Update this dashboard's backend to call the Forklift API instead of mock data
                      </li>
                      <li>
                        Use <a href="https://github.com/kubevirt/kubevirt" target="_blank" rel="noopener noreferrer">
                          KubeVirt
                        </a>{' '}
                        to run migrated VMs alongside your containers
                      </li>
                    </ol>
                  </FlexItem>
                  <FlexItem>
                    <strong>Free Resources:</strong>
                  </FlexItem>
                  <FlexItem>
                    <ul style={{ paddingLeft: '1.5rem' }}>
                      <li>
                        <a href="https://developers.redhat.com/developer-sandbox" target="_blank" rel="noopener noreferrer">
                          Red Hat Developer Sandbox
                        </a>{' '}
                        (free OpenShift cluster)
                      </li>
                      <li>
                        <a href="https://github.com/kubevirt/kubevirt" target="_blank" rel="noopener noreferrer">
                          KubeVirt
                        </a>{' '}
                        and{' '}
                        <a href="https://github.com/konveyor/forklift" target="_blank" rel="noopener noreferrer">
                          Forklift
                        </a>{' '}
                        (open-source, Apache 2.0 licensed)
                      </li>
                    </ul>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <Card>
              <CardTitle>Tech Stack & Architecture</CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <strong>Frontend:</strong> React 19 + TypeScript + PatternFly 6 (Red Hat's design system)
                  </FlexItem>
                  <FlexItem>
                    <strong>Backend:</strong> Node.js + Express + lowdb (JSON database)
                  </FlexItem>
                  <FlexItem>
                    <strong>Real-time:</strong> Server-Sent Events (SSE) for live migration progress
                  </FlexItem>
                  <FlexItem>
                    <strong>Internationalization:</strong> Custom i18n with Hebrew/English support
                  </FlexItem>
                  <FlexItem>
                    <strong>Testing:</strong> Vitest + React Testing Library (unit/component) + Playwright (E2E)
                  </FlexItem>
                  <FlexItem>
                    <strong>CI/CD:</strong> GitHub Actions (lint, type-check, test, build)
                  </FlexItem>
                  <FlexItem>
                    <strong>Deployment:</strong> Vercel (frontend) + Railway (backend, free tier available)
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
}
