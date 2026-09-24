import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useSettings from '../hooks/useSettings';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    platform: {
      name: '',
      description: '',
      logoUrl: '',
      faviconUrl: '',
      supportEmail: '',
      supportPhone: '',
      timezone: 'UTC',
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      maintenanceMode: false,
      maintenanceMessage: ''
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter',
      headerImage: '',
      footerText: ''
    },
    legal: {
      termsUrl: '',
      privacyUrl: '',
      cookiePolicyUrl: '',
      responsibleGamblingUrl: '',
      licenseNumber: '',
      licenseAuthority: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: ''
    },
    features: {
      enableLiveChat: true,
      enableNotifications: true,
      enableNewsletter: true,
      enableReferrals: true,
      enableLoyaltyProgram: true,
      enableSports: true,
      enableCasino: true,
      enableLiveCasino: true,
      enablePoker: false,
      enableBingo: false
    },
    limits: {
      maxDepositAmount: 10000,
      maxWithdrawalAmount: 5000,
      maxBetAmount: 1000,
      maxDailyDeposits: 5,
      maxDailyWithdrawals: 3,
      sessionTimeoutMinutes: 60,
      inactivityTimeoutDays: 30
    },
    social: {
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      telegramUrl: '',
      discordUrl: ''
    }
  });

  const [activeSection, setActiveSection] = useState('platform');
  const [hasChanges, setHasChanges] = useState(false);

  const { 
    generalSettings, 
    loading, 
    error, 
    fetchGeneralSettings, 
    updateGeneralSettings 
  } = useSettings();

  useEffect(() => {
    fetchGeneralSettings();
  }, [fetchGeneralSettings]);

  useEffect(() => {
    if (generalSettings) {
      setSettings(generalSettings);
    }
  }, [generalSettings]);

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateGeneralSettings(settings);
      setHasChanges(false);
      alert('General settings saved successfully!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to their current saved values?')) {
      setSettings(generalSettings);
      setHasChanges(false);
    }
  };

  const sections = [
    { id: 'platform', label: 'Platform', icon: '🏢' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'features', label: 'Features', icon: '🚀' },
    { id: 'limits', label: 'Limits', icon: '🛡️' },
    { id: 'social', label: 'Social', icon: '📱' }
  ];

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Platform Configuration</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Platform Name"
          value={settings.platform.name}
          onChange={(e) => handleSettingChange('platform', 'name', e.target.value)}
          placeholder="Your Gaming Platform"
        />
        <Select
          label="Default Currency"
          value={settings.platform.defaultCurrency}
          onChange={(e) => handleSettingChange('platform', 'defaultCurrency', e.target.value)}
          options={[
            { value: 'USD', label: 'US Dollar (USD)' },
            { value: 'EUR', label: 'Euro (EUR)' },
            { value: 'GBP', label: 'British Pound (GBP)' },
            { value: 'CAD', label: 'Canadian Dollar (CAD)' },
            { value: 'AUD', label: 'Australian Dollar (AUD)' },
            { value: 'JPY', label: 'Japanese Yen (JPY)' },
            { value: 'BTC', label: 'Bitcoin (BTC)' },
            { value: 'ETH', label: 'Ethereum (ETH)' }
          ]}
        />
      </div>

      <Textarea
        label="Platform Description"
        value={settings.platform.description}
        onChange={(e) => handleSettingChange('platform', 'description', e.target.value)}
        placeholder="Describe your gaming platform"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Logo URL"
          value={settings.platform.logoUrl}
          onChange={(e) => handleSettingChange('platform', 'logoUrl', e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        <Input
          label="Favicon URL"
          value={settings.platform.faviconUrl}
          onChange={(e) => handleSettingChange('platform', 'faviconUrl', e.target.value)}
          placeholder="https://example.com/favicon.ico"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Support Email"
          type="email"
          value={settings.platform.supportEmail}
          onChange={(e) => handleSettingChange('platform', 'supportEmail', e.target.value)}
          placeholder="support@yourplatform.com"
        />
        <Input
          label="Support Phone"
          value={settings.platform.supportPhone}
          onChange={(e) => handleSettingChange('platform', 'supportPhone', e.target.value)}
          placeholder="+1-555-123-4567"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Timezone"
          value={settings.platform.timezone}
          onChange={(e) => handleSettingChange('platform', 'timezone', e.target.value)}
          options={[
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Chicago', label: 'Central Time' },
            { value: 'America/Denver', label: 'Mountain Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'London' },
            { value: 'Europe/Paris', label: 'Paris' },
            { value: 'Asia/Tokyo', label: 'Tokyo' },
            { value: 'Asia/Shanghai', label: 'Shanghai' },
            { value: 'Australia/Sydney', label: 'Sydney' }
          ]}
        />
        <Select
          label="Default Language"
          value={settings.platform.defaultLanguage}
          onChange={(e) => handleSettingChange('platform', 'defaultLanguage', e.target.value)}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'it', label: 'Italian' },
            { value: 'pt', label: 'Portuguese' },
            { value: 'ru', label: 'Russian' },
            { value: 'ja', label: 'Japanese' },
            { value: 'ko', label: 'Korean' },
            { value: 'zh', label: 'Chinese' }
          ]}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.platform.maintenanceMode}
          onChange={(e) => handleSettingChange('platform', 'maintenanceMode', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="maintenanceMode" className="text-sm">Maintenance Mode</label>
      </div>

      {settings.platform.maintenanceMode && (
        <Textarea
          label="Maintenance Message"
          value={settings.platform.maintenanceMessage}
          onChange={(e) => handleSettingChange('platform', 'maintenanceMessage', e.target.value)}
          placeholder="We are currently performing maintenance. Please check back soon."
          rows={3}
        />
      )}
    </div>
  );

  const renderBrandingSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Branding Configuration</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.branding.primaryColor}
              onChange={(e) => handleSettingChange('branding', 'primaryColor', e.target.value)}
              className="w-12 h-10 rounded border"
            />
            <Input
              value={settings.branding.primaryColor}
              onChange={(e) => handleSettingChange('branding', 'primaryColor', e.target.value)}
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.branding.secondaryColor}
              onChange={(e) => handleSettingChange('branding', 'secondaryColor', e.target.value)}
              className="w-12 h-10 rounded border"
            />
            <Input
              value={settings.branding.secondaryColor}
              onChange={(e) => handleSettingChange('branding', 'secondaryColor', e.target.value)}
              placeholder="#10B981"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.branding.accentColor}
              onChange={(e) => handleSettingChange('branding', 'accentColor', e.target.value)}
              className="w-12 h-10 rounded border"
            />
            <Input
              value={settings.branding.accentColor}
              onChange={(e) => handleSettingChange('branding', 'accentColor', e.target.value)}
              placeholder="#F59E0B"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.branding.backgroundColor}
              onChange={(e) => handleSettingChange('branding', 'backgroundColor', e.target.value)}
              className="w-12 h-10 rounded border"
            />
            <Input
              value={settings.branding.backgroundColor}
              onChange={(e) => handleSettingChange('branding', 'backgroundColor', e.target.value)}
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.branding.textColor}
              onChange={(e) => handleSettingChange('branding', 'textColor', e.target.value)}
              className="w-12 h-10 rounded border"
            />
            <Input
              value={settings.branding.textColor}
              onChange={(e) => handleSettingChange('branding', 'textColor', e.target.value)}
              placeholder="#1F2937"
            />
          </div>
        </div>
      </div>

      <Select
        label="Font Family"
        value={settings.branding.fontFamily}
        onChange={(e) => handleSettingChange('branding', 'fontFamily', e.target.value)}
        options={[
          { value: 'Inter', label: 'Inter' },
          { value: 'Roboto', label: 'Roboto' },
          { value: 'Open Sans', label: 'Open Sans' },
          { value: 'Poppins', label: 'Poppins' },
          { value: 'Montserrat', label: 'Montserrat' },
          { value: 'Lato', label: 'Lato' },
          { value: 'Source Sans Pro', label: 'Source Sans Pro' }
        ]}
      />

      <Input
        label="Header Image URL"
        value={settings.branding.headerImage}
        onChange={(e) => handleSettingChange('branding', 'headerImage', e.target.value)}
        placeholder="https://example.com/header.jpg"
      />

      <Textarea
        label="Footer Text"
        value={settings.branding.footerText}
        onChange={(e) => handleSettingChange('branding', 'footerText', e.target.value)}
        placeholder="© 2024 Your Gaming Platform. All rights reserved."
        rows={2}
      />
    </div>
  );

  const renderLegalSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Terms of Service URL"
          value={settings.legal.termsUrl}
          onChange={(e) => handleSettingChange('legal', 'termsUrl', e.target.value)}
          placeholder="https://yourplatform.com/terms"
        />
        <Input
          label="Privacy Policy URL"
          value={settings.legal.privacyUrl}
          onChange={(e) => handleSettingChange('legal', 'privacyUrl', e.target.value)}
          placeholder="https://yourplatform.com/privacy"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cookie Policy URL"
          value={settings.legal.cookiePolicyUrl}
          onChange={(e) => handleSettingChange('legal', 'cookiePolicyUrl', e.target.value)}
          placeholder="https://yourplatform.com/cookies"
        />
        <Input
          label="Responsible Gambling URL"
          value={settings.legal.responsibleGamblingUrl}
          onChange={(e) => handleSettingChange('legal', 'responsibleGamblingUrl', e.target.value)}
          placeholder="https://yourplatform.com/responsible-gambling"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="License Number"
          value={settings.legal.licenseNumber}
          onChange={(e) => handleSettingChange('legal', 'licenseNumber', e.target.value)}
          placeholder="MGA/B2C/123/2024"
        />
        <Input
          label="License Authority"
          value={settings.legal.licenseAuthority}
          onChange={(e) => handleSettingChange('legal', 'licenseAuthority', e.target.value)}
          placeholder="Malta Gaming Authority"
        />
      </div>

      <Input
        label="Company Name"
        value={settings.legal.companyName}
        onChange={(e) => handleSettingChange('legal', 'companyName', e.target.value)}
        placeholder="Your Gaming Company Ltd."
      />

      <Textarea
        label="Company Address"
        value={settings.legal.companyAddress}
        onChange={(e) => handleSettingChange('legal', 'companyAddress', e.target.value)}
        placeholder="123 Gaming Street, Malta"
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company Email"
          type="email"
          value={settings.legal.companyEmail}
          onChange={(e) => handleSettingChange('legal', 'companyEmail', e.target.value)}
          placeholder="legal@yourplatform.com"
        />
        <Input
          label="Company Phone"
          value={settings.legal.companyPhone}
          onChange={(e) => handleSettingChange('legal', 'companyPhone', e.target.value)}
          placeholder="+356-123-456-789"
        />
      </div>
    </div>
  );

  const renderFeatureSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Feature Configuration</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">General Features</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableLiveChat"
                checked={settings.features.enableLiveChat}
                onChange={(e) => handleSettingChange('features', 'enableLiveChat', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableLiveChat" className="text-sm">Live Chat Support</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableNotifications"
                checked={settings.features.enableNotifications}
                onChange={(e) => handleSettingChange('features', 'enableNotifications', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableNotifications" className="text-sm">Push Notifications</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableNewsletter"
                checked={settings.features.enableNewsletter}
                onChange={(e) => handleSettingChange('features', 'enableNewsletter', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableNewsletter" className="text-sm">Newsletter Subscriptions</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableReferrals"
                checked={settings.features.enableReferrals}
                onChange={(e) => handleSettingChange('features', 'enableReferrals', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableReferrals" className="text-sm">Referral Program</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableLoyaltyProgram"
                checked={settings.features.enableLoyaltyProgram}
                onChange={(e) => handleSettingChange('features', 'enableLoyaltyProgram', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableLoyaltyProgram" className="text-sm">Loyalty Program</label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Gaming Features</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableSports"
                checked={settings.features.enableSports}
                onChange={(e) => handleSettingChange('features', 'enableSports', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableSports" className="text-sm">Sports Betting</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableCasino"
                checked={settings.features.enableCasino}
                onChange={(e) => handleSettingChange('features', 'enableCasino', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableCasino" className="text-sm">Casino Games</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableLiveCasino"
                checked={settings.features.enableLiveCasino}
                onChange={(e) => handleSettingChange('features', 'enableLiveCasino', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableLiveCasino" className="text-sm">Live Casino</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enablePoker"
                checked={settings.features.enablePoker}
                onChange={(e) => handleSettingChange('features', 'enablePoker', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enablePoker" className="text-sm">Poker</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableBingo"
                checked={settings.features.enableBingo}
                onChange={(e) => handleSettingChange('features', 'enableBingo', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableBingo" className="text-sm">Bingo</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLimitSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Platform Limits</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Max Deposit Amount"
          type="number"
          value={settings.limits.maxDepositAmount}
          onChange={(e) => handleSettingChange('limits', 'maxDepositAmount', parseFloat(e.target.value))}
          min="100"
          max="100000"
        />
        <Input
          label="Max Withdrawal Amount"
          type="number"
          value={settings.limits.maxWithdrawalAmount}
          onChange={(e) => handleSettingChange('limits', 'maxWithdrawalAmount', parseFloat(e.target.value))}
          min="100"
          max="50000"
        />
        <Input
          label="Max Bet Amount"
          type="number"
          value={settings.limits.maxBetAmount}
          onChange={(e) => handleSettingChange('limits', 'maxBetAmount', parseFloat(e.target.value))}
          min="1"
          max="10000"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Max Daily Deposits"
          type="number"
          value={settings.limits.maxDailyDeposits}
          onChange={(e) => handleSettingChange('limits', 'maxDailyDeposits', parseInt(e.target.value))}
          min="1"
          max="20"
        />
        <Input
          label="Max Daily Withdrawals"
          type="number"
          value={settings.limits.maxDailyWithdrawals}
          onChange={(e) => handleSettingChange('limits', 'maxDailyWithdrawals', parseInt(e.target.value))}
          min="1"
          max="10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.limits.sessionTimeoutMinutes}
          onChange={(e) => handleSettingChange('limits', 'sessionTimeoutMinutes', parseInt(e.target.value))}
          min="15"
          max="480"
        />
        <Input
          label="Inactivity Timeout (days)"
          type="number"
          value={settings.limits.inactivityTimeoutDays}
          onChange={(e) => handleSettingChange('limits', 'inactivityTimeoutDays', parseInt(e.target.value))}
          min="7"
          max="365"
        />
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Facebook URL"
          value={settings.social.facebookUrl}
          onChange={(e) => handleSettingChange('social', 'facebookUrl', e.target.value)}
          placeholder="https://facebook.com/yourplatform"
        />
        <Input
          label="Twitter URL"
          value={settings.social.twitterUrl}
          onChange={(e) => handleSettingChange('social', 'twitterUrl', e.target.value)}
          placeholder="https://twitter.com/yourplatform"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Instagram URL"
          value={settings.social.instagramUrl}
          onChange={(e) => handleSettingChange('social', 'instagramUrl', e.target.value)}
          placeholder="https://instagram.com/yourplatform"
        />
        <Input
          label="YouTube URL"
          value={settings.social.youtubeUrl}
          onChange={(e) => handleSettingChange('social', 'youtubeUrl', e.target.value)}
          placeholder="https://youtube.com/yourplatform"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Telegram URL"
          value={settings.social.telegramUrl}
          onChange={(e) => handleSettingChange('social', 'telegramUrl', e.target.value)}
          placeholder="https://t.me/yourplatform"
        />
        <Input
          label="Discord URL"
          value={settings.social.discordUrl}
          onChange={(e) => handleSettingChange('social', 'discordUrl', e.target.value)}
          placeholder="https://discord.gg/yourplatform"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'platform':
        return renderPlatformSettings();
      case 'branding':
        return renderBrandingSettings();
      case 'legal':
        return renderLegalSettings();
      case 'features':
        return renderFeatureSettings();
      case 'limits':
        return renderLimitSettings();
      case 'social':
        return renderSocialSettings();
      default:
        return renderPlatformSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">General Settings</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handleResetSettings} disabled={!hasChanges}>
            Reset Changes
          </Button>
          <Button variant="primary" onClick={handleSaveSettings} disabled={!hasChanges || loading}>
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <div className="p-4">
            <h3 className="font-medium mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3">
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              renderContent()
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GeneralSettings; 