import { AppVariant } from '../../appVariant';
import { mainConfig } from '../../apps/main/config';
import { pmgConfig } from '../../apps/pmg/config';
import { guideConfig } from '../../apps/guide/config';
import { wppConfig } from '../../apps/wpp/config';
import { indexExchangeConfig } from '../../apps/index-exchange/config';
import { equativConfig } from '../../apps/equativ/config';
import { nflConfig } from '../../apps/nfl/config';
import type { AppConfig } from './appConfig';

const CONFIGS: Record<AppVariant, AppConfig> = {
  main: mainConfig,
  pmg: pmgConfig,
  guide: guideConfig,
  wpp: wppConfig,
  'index-exchange': indexExchangeConfig,
  equativ: equativConfig,
  nfl: nflConfig,
};

export function getConfig(variant: AppVariant): AppConfig {
  return CONFIGS[variant] ?? mainConfig;
}
