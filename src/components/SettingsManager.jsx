import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const {
  FiUser, FiBell, FiDollarSign, FiLink, FiSave, FiCalendar, FiVideo,
  FiMessageSquare, FiDatabase, FiRefreshCw, FiCheck, FiAlertCircle
} = FiIcons;

const SettingsManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [settings, setSettings] = useState({
    profile: {
      name: 'Guy Tasaka',
      title: 'AI Media Consultant & Innovation Leader',
      email: 'guy@tasakadigital.com',
      phone: '+1 (555) 123-4567',
      timezone: 'Pacific Time (PT)',
      bio: 'Leading AI transformation in media with 35+ years of industry experience.'
    },
    notifications: {
      emailConsultations: true,
      emailLeads: true,
      emailWeeklyReport: true,
      smsUrgent: false,
      desktopNotifications: true
    },
    business: {
      consultationRate: 500,
      consultationDuration: 60,
      autoConfirmation: false,
      requireApproval: true,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    integrations: {
      calendly: false,
      zoom: true,
      slack: false,
      hubspot: false
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings_sys')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }
      
      if (data) {
        setSettings({
          profile: data.profile || settings.profile,
          notifications: data.notifications || settings.notifications,
          business: data.business || settings.business,
          integrations: data.integrations || settings.integrations,
          id: data.id
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('admin_settings_sys')
          .update({
            profile: settings.profile,
            notifications: settings.notifications,
            business: settings.business,
            integrations: settings.integrations,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);
          
        if (error) throw error;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('admin_settings_sys')
          .insert([{
            profile: settings.profile,
            notifications: settings.notifications,
            business: settings.business,
            integrations: settings.integrations
          }])
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          setSettings(prev => ({ ...prev, id: data[0].id }));
        }
      }
      
      setSaveStatus('success');
      
      // Create activity for settings update
      await supabase
        .from('activity_feed_admin_sys')
        .insert([{
          type: 'settings_updated',
          title: 'Settings updated',
          description: 'System settings were updated',
          icon: 'FiSettings',
          color: 'blue'
        }]);
        
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      
      // Clear save status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const handleSettingsUpdate = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleWorkingDayToggle = (day) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        workingDays: prev.business.workingDays.includes(day)
          ? prev.business.workingDays.filter(d => d !== day)
          : [...prev.business.workingDays, day]
      }
    }));
  };

  const handleNestedSettingsUpdate = (section, nestedField, nestedKey, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedField]: {
          ...prev[section][nestedField],
          [nestedKey]: value
        }
      }
    }));
  };

  const handleIntegrationToggle = (integration) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: !prev.integrations[integration]
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">Manage your account and business preferences</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={isSaving}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Save Status Messages */}
      {saveStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 mr-2" />
          <span>Failed to save settings. Please try again.</span>
        </div>
      )}

      <div className="grid gap-8">
        {/* Profile Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiUser} className="w-5 h-5 mr-2" />
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => handleSettingsUpdate('profile', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
              <input
                type="text"
                value={settings.profile.title}
                onChange={(e) => handleSettingsUpdate('profile', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingsUpdate('profile', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => handleSettingsUpdate('profile', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.profile.timezone}
                onChange={(e) => handleSettingsUpdate('profile', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                <option value="Mountain Time (MT)">Mountain Time (MT)</option>
                <option value="Central Time (CT)">Central Time (CT)</option>
                <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                <option value="GMT/UTC">GMT/UTC</option>
                <option value="Central European Time (CET)">Central European Time (CET)</option>
                <option value="Asia Pacific (APAC)">Asia Pacific (APAC)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
              <textarea
                value={settings.profile.bio}
                onChange={(e) => handleSettingsUpdate('profile', 'bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiBell} className="w-5 h-5 mr-2" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email Notifications - New Consultations</div>
                <div className="text-sm text-gray-500">Get notified when someone books a consultation</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailConsultations}
                  onChange={(e) => handleSettingsUpdate('notifications', 'emailConsultations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email Notifications - New Leads</div>
                <div className="text-sm text-gray-500">Get notified about new lead generation</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailLeads}
                  onChange={(e) => handleSettingsUpdate('notifications', 'emailLeads', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Weekly Report Email</div>
                <div className="text-sm text-gray-500">Receive weekly performance summaries</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailWeeklyReport}
                  onChange={(e) => handleSettingsUpdate('notifications', 'emailWeeklyReport', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">SMS Notifications - Urgent</div>
                <div className="text-sm text-gray-500">SMS for high-priority items only</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsUrgent}
                  onChange={(e) => handleSettingsUpdate('notifications', 'smsUrgent', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Desktop Notifications</div>
                <div className="text-sm text-gray-500">Browser notifications for important events</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.desktopNotifications}
                  onChange={(e) => handleSettingsUpdate('notifications', 'desktopNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiDollarSign} className="w-5 h-5 mr-2" />
            Business Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Rate (per hour)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={settings.business.consultationRate}
                  onChange={(e) => handleSettingsUpdate('business', 'consultationRate', parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Duration (minutes)</label>
              <input
                type="number"
                value={settings.business.consultationDuration}
                onChange={(e) => handleSettingsUpdate('business', 'consultationDuration', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours Start</label>
              <input
                type="time"
                value={settings.business.workingHours.start}
                onChange={(e) => handleNestedSettingsUpdate('business', 'workingHours', 'start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours End</label>
              <input
                type="time"
                value={settings.business.workingHours.end}
                onChange={(e) => handleNestedSettingsUpdate('business', 'workingHours', 'end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleWorkingDayToggle(day)}
                    className={`p-2 text-sm rounded-lg border ${
                      settings.business.workingDays.includes(day)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Auto-confirm consultations</div>
                <div className="text-sm text-gray-500">Automatically confirm bookings without manual approval</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.business.autoConfirmation}
                  onChange={(e) => handleSettingsUpdate('business', 'autoConfirmation', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Require manual approval</div>
                <div className="text-sm text-gray-500">All bookings must be reviewed before confirmation</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.business.requireApproval}
                  onChange={(e) => handleSettingsUpdate('business', 'requireApproval', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiLink} className="w-5 h-5 mr-2" />
            Integrations
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCalendar} className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Calendly</div>
                  <div className="text-sm text-gray-500">Calendar scheduling integration</div>
                </div>
              </div>
              <button
                onClick={() => handleIntegrationToggle('calendly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  settings.integrations.calendly
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.integrations.calendly ? 'Connected' : 'Connect'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiVideo} className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Zoom</div>
                  <div className="text-sm text-gray-500">Video conferencing for consultations</div>
                </div>
              </div>
              <button
                onClick={() => handleIntegrationToggle('zoom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  settings.integrations.zoom
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.integrations.zoom ? 'Connected' : 'Connect'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMessageSquare} className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Slack</div>
                  <div className="text-sm text-gray-500">Team notifications and updates</div>
                </div>
              </div>
              <button
                onClick={() => handleIntegrationToggle('slack')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  settings.integrations.slack
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.integrations.slack ? 'Connected' : 'Connect'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiDatabase} className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">HubSpot</div>
                  <div className="text-sm text-gray-500">CRM and lead management</div>
                </div>
              </div>
              <button
                onClick={() => handleIntegrationToggle('hubspot')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  settings.integrations.hubspot
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.integrations.hubspot ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className={`bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;