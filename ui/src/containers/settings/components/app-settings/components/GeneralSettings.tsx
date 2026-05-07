import React from 'react';
import { Settings, Database } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Switch } from '@ikim-ui/ui-components/primitive/switch';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { GeneralSettingsProps } from '../types/AppSettings.types';

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onAutoSaveChange,
  onNotificationsChange,
}) => (
  <div className="mb-8 space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Settings className="w-5 h-5" />
      <h2 className="text-xl font-bold">General Settings</h2>
    </div>

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="w-4 h-4" />
          Application Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center space-x-2">
          <Switch
            id="autoSave"
            checked={settings.autoSave || false}
            onCheckedChange={onAutoSaveChange}
          />
          <Label htmlFor="autoSave">Auto-save annotations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={settings.notifications || false}
            onCheckedChange={onNotificationsChange}
          />
          <Label htmlFor="notifications">Enable notifications</Label>
        </div>
      </CardContent>
    </Card>
  </div>
);
