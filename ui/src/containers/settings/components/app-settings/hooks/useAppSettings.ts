import { useGlobalSettings } from '../../../../project/stores/globalSettings';

export function useAppSettings() {
  const { settings } = useGlobalSettings();

  return {
    settings,
  };
}
