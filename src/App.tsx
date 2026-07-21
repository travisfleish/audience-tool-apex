import { Analytics } from '@vercel/analytics/react';
import { APP_VARIANT } from './appVariant';
import { MainApp } from './apps/main/MainApp';
import { PmgApp } from './apps/pmg/PmgApp';
import { GuideApp } from './apps/guide/GuideApp';
import { WppApp } from './apps/wpp/WppApp';
import { IndexExchangeApp } from './apps/index-exchange/IndexExchangeApp';
import { EquativApp } from './apps/equativ/EquativApp';
import { NflApp } from './apps/nfl/NflApp';
import { ApexApp } from './apps/apex/ApexApp';
// v2.0.0

function App() {
  return (
    <>
      {APP_VARIANT === 'pmg' ? (
        <PmgApp />
      ) : APP_VARIANT === 'guide' ? (
        <GuideApp />
      ) : APP_VARIANT === 'wpp' ? (
        <WppApp />
      ) : APP_VARIANT === 'index-exchange' ? (
        <IndexExchangeApp />
      ) : APP_VARIANT === 'equativ' ? (
        <EquativApp />
      ) : APP_VARIANT === 'nfl' ? (
        <NflApp />
      ) : APP_VARIANT === 'apex' ? (
        <ApexApp />
      ) : (
        <MainApp />
      )}
      <Analytics />
    </>
  );
}

export default App;
