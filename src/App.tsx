import React from 'react';
import { Page, Masthead, MastheadMain, MastheadBrand, MastheadContent } from '@patternfly/react-core';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadBrand style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Migration Toolkit (Demo)
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent style={{ marginLeft: 'auto', paddingRight: '20px' }}>
        Estee Cohen - Assignment
      </MastheadContent>
    </Masthead>
  );

  return (
    <Page masthead={masthead} style={{ minHeight: '100vh' }}>
      <Dashboard />
    </Page>
  );
};

export default App;