export interface AppSettingsPageProps {
  // This component doesn't take props, but we'll keep the interface for consistency
}

export interface GeneralSettingsProps {
  settings: {
    autoSave?: boolean;
    notifications?: boolean;
  };
  onAutoSaveChange: (checked: boolean) => void;
  onNotificationsChange: (checked: boolean) => void;
}
