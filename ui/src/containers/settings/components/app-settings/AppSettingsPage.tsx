import React from 'react';
import { useAppSettings } from './hooks/useAppSettings';
import { GeneralSettings } from './components/GeneralSettings';
import { LLMSettingsSection } from './components/LLMSettingsSection';

export function AppSettingsPage() {
  const { settings } = useAppSettings();

  const handleAutoSaveChange = (checked: boolean) => {
    // Update global settings
    const updatedSettings = { ...settings, autoSave: checked };
    // You'll need to implement this in your global settings store
  };

  const handleNotificationsChange = (checked: boolean) => {
    // Update global settings
    const updatedSettings = { ...settings, notifications: checked };
    // You'll need to implement this in your global settings store
  };

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">App Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your application settings and LLM providers
          </p>
        </div>
      </div>

      <GeneralSettings
        settings={settings}
        onAutoSaveChange={handleAutoSaveChange}
        onNotificationsChange={handleNotificationsChange}
      />

      <LLMSettingsSection />
    </div>
  );
}
