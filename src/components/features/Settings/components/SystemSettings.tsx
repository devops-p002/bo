import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useSettings from '../hooks/useSettings';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    database: {
      connectionString: '',
      maxConnections: 100,
      timeoutSeconds: 30,
      autoBackup: true,
      backupInterval: '24',
      retentionDays: 30
    },
    cache: {
      enabled: true,
      provider: 'redis',
      ttlSeconds: 3600,
      maxMemoryMB: 512,
      evictionPolicy: 'allkeys-lru'
    },
    api: {
      rateLimit: 1000,
      rateLimitWindow: 60,
      corsEnabled: true,
      allowedOrigins: '',
      maxRequestSize: 10,
      timeoutSeconds: 30
    },
    security: {
      jwtSecret: '',
      jwtExpiryHours: 24,
      passwordMinLength: 8,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      twoFactorAuth: false,
      sslRequired: true
    },
    logging: {
      level: 'info',
      retentionDays: 30,
      enableFileLogging: true,
      enableDatabaseLogging: true,
      enableConsoleLogging: true,
      maxLogFileSizeMB: 100
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      webhookEnabled: false,
      webhookUrl: '',
      emailProvider: 'smtp',
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: ''
    },
    monitoring: {
      enabled: true,
      alertThresholds: {
        cpuPercent: 80,
        memoryPercent: 85,
        diskPercent: 90,
        responseTimeMs: 5000
      },
      healthCheckIntervalSeconds: 60,
      metricsRetentionDays: 7
    }
  });

  const [activeSection, setActiveSection] = useState('database');
  const [hasChanges, setHasChanges] = useState(false);

  const { 
    systemSettings, 
    loading, 
    error, 
    fetchSystemSettings, 
    updateSystemSettings 
  } = useSettings();

  useEffect(() => {
    fetchSystemSettings();
  }, [fetchSystemSettings]);

  useEffect(() => {
    if (systemSettings) {
      setSettings(systemSettings);
    }
  }, [systemSettings]);

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

  const handleNestedSettingChange = (section, nestedSection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSystemSettings(settings);
      setHasChanges(false);
      alert('System settings saved successfully!');
    } catch (error) {
      console.error('Error saving system settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings(systemSettings);
      setHasChanges(false);
    }
  };

  const sections = [
    { id: 'database', label: 'Database', icon: '🗄️' },
    { id: 'cache', label: 'Cache', icon: '⚡' },
    { id: 'api', label: 'API', icon: '🔌' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'logging', label: 'Logging', icon: '📝' },
    { id: 'notifications', label: 'Notifications', icon: '📧' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' }
  ];

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Database Configuration</h3>
      
      <Input
        label="Connection String"
        value={settings.database.connectionString}
        onChange={(e) => handleSettingChange('database', 'connectionString', e.target.value)}
        placeholder="Database connection string"
        type="password"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Max Connections"
          type="number"
          value={settings.database.maxConnections}
          onChange={(e) => handleSettingChange('database', 'maxConnections', parseInt(e.target.value))}
          min="1"
          max="1000"
        />
        <Input
          label="Timeout (seconds)"
          type="number"
          value={settings.database.timeoutSeconds}
          onChange={(e) => handleSettingChange('database', 'timeoutSeconds', parseInt(e.target.value))}
          min="1"
          max="300"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoBackup"
          checked={settings.database.autoBackup}
          onChange={(e) => handleSettingChange('database', 'autoBackup', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="autoBackup" className="text-sm">Enable Auto Backup</label>
      </div>

      {settings.database.autoBackup && (
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Backup Interval (hours)"
            value={settings.database.backupInterval}
            onChange={(e) => handleSettingChange('database', 'backupInterval', e.target.value)}
            options={[
              { value: '6', label: 'Every 6 hours' },
              { value: '12', label: 'Every 12 hours' },
              { value: '24', label: 'Daily' },
              { value: '168', label: 'Weekly' }
            ]}
          />
          <Input
            label="Retention Days"
            type="number"
            value={settings.database.retentionDays}
            onChange={(e) => handleSettingChange('database', 'retentionDays', parseInt(e.target.value))}
            min="1"
            max="365"
          />
        </div>
      )}
    </div>
  );

  const renderCacheSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Cache Configuration</h3>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="cacheEnabled"
          checked={settings.cache.enabled}
          onChange={(e) => handleSettingChange('cache', 'enabled', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="cacheEnabled" className="text-sm">Enable Caching</label>
      </div>

      {settings.cache.enabled && (
        <>
          <Select
            label="Cache Provider"
            value={settings.cache.provider}
            onChange={(e) => handleSettingChange('cache', 'provider', e.target.value)}
            options={[
              { value: 'redis', label: 'Redis' },
              { value: 'memcached', label: 'Memcached' },
              { value: 'memory', label: 'In-Memory' }
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="TTL (seconds)"
              type="number"
              value={settings.cache.ttlSeconds}
              onChange={(e) => handleSettingChange('cache', 'ttlSeconds', parseInt(e.target.value))}
              min="60"
              max="86400"
            />
            <Input
              label="Max Memory (MB)"
              type="number"
              value={settings.cache.maxMemoryMB}
              onChange={(e) => handleSettingChange('cache', 'maxMemoryMB', parseInt(e.target.value))}
              min="64"
              max="8192"
            />
          </div>

          <Select
            label="Eviction Policy"
            value={settings.cache.evictionPolicy}
            onChange={(e) => handleSettingChange('cache', 'evictionPolicy', e.target.value)}
            options={[
              { value: 'allkeys-lru', label: 'LRU (Least Recently Used)' },
              { value: 'allkeys-lfu', label: 'LFU (Least Frequently Used)' },
              { value: 'volatile-lru', label: 'Volatile LRU' },
              { value: 'volatile-ttl', label: 'Volatile TTL' }
            ]}
          />
        </>
      )}
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Rate Limit (requests/window)"
          type="number"
          value={settings.api.rateLimit}
          onChange={(e) => handleSettingChange('api', 'rateLimit', parseInt(e.target.value))}
          min="100"
          max="10000"
        />
        <Input
          label="Rate Limit Window (seconds)"
          type="number"
          value={settings.api.rateLimitWindow}
          onChange={(e) => handleSettingChange('api', 'rateLimitWindow', parseInt(e.target.value))}
          min="60"
          max="3600"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="corsEnabled"
          checked={settings.api.corsEnabled}
          onChange={(e) => handleSettingChange('api', 'corsEnabled', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="corsEnabled" className="text-sm">Enable CORS</label>
      </div>

      {settings.api.corsEnabled && (
        <Textarea
          label="Allowed Origins (one per line)"
          value={settings.api.allowedOrigins}
          onChange={(e) => handleSettingChange('api', 'allowedOrigins', e.target.value)}
          placeholder="https://example.com&#10;https://app.example.com"
          rows={4}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Max Request Size (MB)"
          type="number"
          value={settings.api.maxRequestSize}
          onChange={(e) => handleSettingChange('api', 'maxRequestSize', parseInt(e.target.value))}
          min="1"
          max="100"
        />
        <Input
          label="Timeout (seconds)"
          type="number"
          value={settings.api.timeoutSeconds}
          onChange={(e) => handleSettingChange('api', 'timeoutSeconds', parseInt(e.target.value))}
          min="10"
          max="300"
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Security Configuration</h3>
      
      <Input
        label="JWT Secret"
        type="password"
        value={settings.security.jwtSecret}
        onChange={(e) => handleSettingChange('security', 'jwtSecret', e.target.value)}
        placeholder="JWT secret key"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="JWT Expiry (hours)"
          type="number"
          value={settings.security.jwtExpiryHours}
          onChange={(e) => handleSettingChange('security', 'jwtExpiryHours', parseInt(e.target.value))}
          min="1"
          max="168"
        />
        <Input
          label="Min Password Length"
          type="number"
          value={settings.security.passwordMinLength}
          onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
          min="6"
          max="32"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.security.sessionTimeoutMinutes}
          onChange={(e) => handleSettingChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
          min="5"
          max="480"
        />
        <Input
          label="Max Login Attempts"
          type="number"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
          min="3"
          max="20"
        />
      </div>

      <Input
        label="Lockout Duration (minutes)"
        type="number"
        value={settings.security.lockoutDurationMinutes}
        onChange={(e) => handleSettingChange('security', 'lockoutDurationMinutes', parseInt(e.target.value))}
        min="5"
        max="1440"
      />

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="twoFactorAuth" className="text-sm">Enable Two-Factor Authentication</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sslRequired"
            checked={settings.security.sslRequired}
            onChange={(e) => handleSettingChange('security', 'sslRequired', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sslRequired" className="text-sm">Require SSL/HTTPS</label>
        </div>
      </div>
    </div>
  );

  const renderLoggingSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Logging Configuration</h3>
      
      <Select
        label="Log Level"
        value={settings.logging.level}
        onChange={(e) => handleSettingChange('logging', 'level', e.target.value)}
        options={[
          { value: 'error', label: 'Error' },
          { value: 'warn', label: 'Warning' },
          { value: 'info', label: 'Info' },
          { value: 'debug', label: 'Debug' },
          { value: 'trace', label: 'Trace' }
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Retention Days"
          type="number"
          value={settings.logging.retentionDays}
          onChange={(e) => handleSettingChange('logging', 'retentionDays', parseInt(e.target.value))}
          min="1"
          max="365"
        />
        <Input
          label="Max Log File Size (MB)"
          type="number"
          value={settings.logging.maxLogFileSizeMB}
          onChange={(e) => handleSettingChange('logging', 'maxLogFileSizeMB', parseInt(e.target.value))}
          min="10"
          max="1000"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableFileLogging"
            checked={settings.logging.enableFileLogging}
            onChange={(e) => handleSettingChange('logging', 'enableFileLogging', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="enableFileLogging" className="text-sm">Enable File Logging</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableDatabaseLogging"
            checked={settings.logging.enableDatabaseLogging}
            onChange={(e) => handleSettingChange('logging', 'enableDatabaseLogging', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="enableDatabaseLogging" className="text-sm">Enable Database Logging</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableConsoleLogging"
            checked={settings.logging.enableConsoleLogging}
            onChange={(e) => handleSettingChange('logging', 'enableConsoleLogging', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="enableConsoleLogging" className="text-sm">Enable Console Logging</label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Notification Configuration</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailEnabled"
            checked={settings.notifications.emailEnabled}
            onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="emailEnabled" className="text-sm">Enable Email Notifications</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="smsEnabled"
            checked={settings.notifications.smsEnabled}
            onChange={(e) => handleSettingChange('notifications', 'smsEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="smsEnabled" className="text-sm">Enable SMS Notifications</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="pushEnabled"
            checked={settings.notifications.pushEnabled}
            onChange={(e) => handleSettingChange('notifications', 'pushEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="pushEnabled" className="text-sm">Enable Push Notifications</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="webhookEnabled"
            checked={settings.notifications.webhookEnabled}
            onChange={(e) => handleSettingChange('notifications', 'webhookEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="webhookEnabled" className="text-sm">Enable Webhook Notifications</label>
        </div>
      </div>

      {settings.notifications.webhookEnabled && (
        <Input
          label="Webhook URL"
          value={settings.notifications.webhookUrl}
          onChange={(e) => handleSettingChange('notifications', 'webhookUrl', e.target.value)}
          placeholder="https://example.com/webhook"
        />
      )}

      {settings.notifications.emailEnabled && (
        <div className="space-y-4">
          <Select
            label="Email Provider"
            value={settings.notifications.emailProvider}
            onChange={(e) => handleSettingChange('notifications', 'emailProvider', e.target.value)}
            options={[
              { value: 'smtp', label: 'SMTP' },
              { value: 'sendgrid', label: 'SendGrid' },
              { value: 'mailgun', label: 'Mailgun' },
              { value: 'ses', label: 'Amazon SES' }
            ]}
          />

          {settings.notifications.emailProvider === 'smtp' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                value={settings.notifications.smtpHost}
                onChange={(e) => handleSettingChange('notifications', 'smtpHost', e.target.value)}
                placeholder="smtp.example.com"
              />
              <Input
                label="SMTP Port"
                type="number"
                value={settings.notifications.smtpPort}
                onChange={(e) => handleSettingChange('notifications', 'smtpPort', parseInt(e.target.value))}
                min="25"
                max="65535"
              />
              <Input
                label="SMTP Username"
                value={settings.notifications.smtpUsername}
                onChange={(e) => handleSettingChange('notifications', 'smtpUsername', e.target.value)}
                placeholder="username@example.com"
              />
              <Input
                label="SMTP Password"
                type="password"
                value={settings.notifications.smtpPassword}
                onChange={(e) => handleSettingChange('notifications', 'smtpPassword', e.target.value)}
                placeholder="Password"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMonitoringSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Monitoring Configuration</h3>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="monitoringEnabled"
          checked={settings.monitoring.enabled}
          onChange={(e) => handleSettingChange('monitoring', 'enabled', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="monitoringEnabled" className="text-sm">Enable Monitoring</label>
      </div>

      {settings.monitoring.enabled && (
        <>
          <div className="space-y-4">
            <h4 className="font-medium">Alert Thresholds</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CPU Usage (%)"
                type="number"
                value={settings.monitoring.alertThresholds.cpuPercent}
                onChange={(e) => handleNestedSettingChange('monitoring', 'alertThresholds', 'cpuPercent', parseInt(e.target.value))}
                min="50"
                max="100"
              />
              <Input
                label="Memory Usage (%)"
                type="number"
                value={settings.monitoring.alertThresholds.memoryPercent}
                onChange={(e) => handleNestedSettingChange('monitoring', 'alertThresholds', 'memoryPercent', parseInt(e.target.value))}
                min="50"
                max="100"
              />
              <Input
                label="Disk Usage (%)"
                type="number"
                value={settings.monitoring.alertThresholds.diskPercent}
                onChange={(e) => handleNestedSettingChange('monitoring', 'alertThresholds', 'diskPercent', parseInt(e.target.value))}
                min="50"
                max="100"
              />
              <Input
                label="Response Time (ms)"
                type="number"
                value={settings.monitoring.alertThresholds.responseTimeMs}
                onChange={(e) => handleNestedSettingChange('monitoring', 'alertThresholds', 'responseTimeMs', parseInt(e.target.value))}
                min="1000"
                max="30000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Health Check Interval (seconds)"
              type="number"
              value={settings.monitoring.healthCheckIntervalSeconds}
              onChange={(e) => handleSettingChange('monitoring', 'healthCheckIntervalSeconds', parseInt(e.target.value))}
              min="30"
              max="300"
            />
            <Input
              label="Metrics Retention (days)"
              type="number"
              value={settings.monitoring.metricsRetentionDays}
              onChange={(e) => handleSettingChange('monitoring', 'metricsRetentionDays', parseInt(e.target.value))}
              min="1"
              max="30"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'database':
        return renderDatabaseSettings();
      case 'cache':
        return renderCacheSettings();
      case 'api':
        return renderApiSettings();
      case 'security':
        return renderSecuritySettings();
      case 'logging':
        return renderLoggingSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'monitoring':
        return renderMonitoringSettings();
      default:
        return renderDatabaseSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Settings</h2>
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

export default SystemSettings; 