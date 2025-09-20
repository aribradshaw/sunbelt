import type { UserConfigs } from './types';
import samherstConfig from './samherst';
import ld2Config from './ld2';
import lorainConfig from './lorain';

export const userConfigs: UserConfigs = {
  SouthAmherst: samherstConfig,
  LD2: ld2Config,
  Lorain: lorainConfig,
};

export const getUserConfig = (portal: string) => {
  return userConfigs[portal] || null;
};

export const getAllUserConfigs = () => {
  return userConfigs;
};

export { samherstConfig, ld2Config, lorainConfig };
export * from './types';
