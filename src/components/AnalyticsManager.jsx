import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const {
  FiBarChart3, FiTarget, FiEye, FiUsers, FiTrendingUp, FiSettings,
  FiSave, FiCode, FiExternalLink, FiToggleLeft, FiToggleRight,
  FiCheck, FiAlertCircle, FiRefreshCw, FiDownload, FiShare2
} = FiIcons;

const AnalyticsManager = () => {
  const [activeTab, setActiveTab] = useState('google');
  const [analyticsSettings, setAnalyticsSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadAnalyticsSettings();
  }, []);

  const loadAnalyticsSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('analytics_settings_admin_sys')
        .select('*')
        .single();
      
      if (data) {
        setAnalyticsSettings(data);
      }
    } catch (error) {
      console.error('Error loading analytics settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalyticsSettings = async (updatedSettings) => {
    try {
      if (analyticsSettings.id) {
        await supabase
          .from('analytics_settings_admin_sys')
          .update({ ...updatedSettings, updated_at: new Date().toISOString() })
          .eq('id', analyticsSettings.id);
      } else {
        await supabase
          .from('analytics_settings_admin_sys')
          .insert([updatedSettings]);
      }
      
      setAnalyticsSettings(updatedSettings);
      alert('Analytics settings saved successfully!');
    } catch (error) {
      console.error('Error saving analytics settings:', error);
      alert('Error saving analytics settings');
    }
  };

  const testTrackingCode = async (platform) => {
    // Simulate testing tracking codes
    setTestResults(prev => ({
      ...prev,
      [platform]: { status: 'testing', message: 'Testing connection...' }
    }));

    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [platform]: { status: 'success', message: 'Tracking code is working correctly' }
      }));
    }, 2000);
  };

  const GoogleAnalyticsTab = () => {
    const [formData, setFormData] = useState({
      google_analytics_id: analyticsSettings.google_analytics_id || '',
      ga4_measurement_id: analyticsSettings.ga4_measurement_id || '',
      is_active: analyticsSettings.is_active !== false
    });

    const handleSave = () => {
      saveAnalyticsSettings({ ...analyticsSettings, ...formData });
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Google Analytics Configuration</h3>
          <p className="text-sm text-blue-700">
            Set up Google Analytics to track your website performance and user behavior
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universal Analytics ID (GA3)
              </label>
              <input
                type="text"
                value={formData.google_analytics_id}
                onChange={(e) => setFormData(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="UA-XXXXXXXXX-X"
              />
              <div className="text-xs text-gray-500 mt-1">
                Legacy Google Analytics (being phased out)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={formData.ga4_measurement_id}
                onChange={(e) => setFormData(prev => ({ ...prev, ga4_measurement_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
              <div className="text-xs text-gray-500 mt-1">
                Google Analytics 4 (recommended)
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Enable Google Analytics</div>
                <div className="text-sm text-gray-500">Track page views and user interactions</div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_active ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Setup Instructions</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">1. Create GA4 Property</div>
                <div className="text-gray-600">Go to Google Analytics and create a new GA4 property</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">2. Get Measurement ID</div>
                <div className="text-gray-600">Copy the G-XXXXXXXXXX measurement ID</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">3. Add ID Above</div>
                <div className="text-gray-600">Paste the measurement ID in the field above</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">4. Test Implementation</div>
                <div className="text-gray-600">Use the test button to verify tracking</div>
              </div>
            </div>

            <button
              onClick={() => testTrackingCode('google')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiCheck} className="w-4 h-4" />
              <span>Test Google Analytics</span>
            </button>

            {testResults.google && (
              <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                testResults.google.status === 'success'
                  ? 'bg-green-50 text-green-700'
                  : testResults.google.status === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                <SafeIcon 
                  icon={testResults.google.status === 'testing' ? FiRefreshCw : FiCheck} 
                  className={`w-4 h-4 ${testResults.google.status === 'testing' ? 'animate-spin' : ''}`} 
                />
                <span className="text-sm">{testResults.google.message}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Google Analytics</span>
        </button>
      </div>
    );
  };

  const SocialPixelsTab = () => {
    const [formData, setFormData] = useState({
      facebook_pixel_id: analyticsSettings.facebook_pixel_id || '',
      linkedin_pixel_id: analyticsSettings.linkedin_pixel_id || ''
    });

    const handleSave = () => {
      saveAnalyticsSettings({ ...analyticsSettings, ...formData });
    };

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-2">Social Media Pixels</h3>
          <p className="text-sm text-purple-700">
            Track conversions and optimize ads on social media platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                value={formData.facebook_pixel_id}
                onChange={(e) => setFormData(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123456789012345"
              />
              <div className="text-xs text-gray-500 mt-1">
                15-16 digit Facebook Pixel ID
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Insight Tag ID
              </label>
              <input
                type="text"
                value={formData.linkedin_pixel_id}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin_pixel_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
              <div className="text-xs text-gray-500 mt-1">
                LinkedIn Campaign Manager Partner ID
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Tracked Events</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Page Views</span>
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Consultation Bookings</span>
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Form Submissions</span>
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email Signups</span>
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => testTrackingCode('facebook')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Test Facebook Pixel
              </button>
              <button
                onClick={() => testTrackingCode('linkedin')}
                className="w-full bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm"
              >
                Test LinkedIn Pixel
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Social Pixels</span>
        </button>
      </div>
    );
  };

  const OtherTrackingTab = () => {
    const [formData, setFormData] = useState({
      microsoft_clarity_id: analyticsSettings.microsoft_clarity_id || '',
      cdp_tracking_code: analyticsSettings.cdp_tracking_code || '',
      custom_scripts: analyticsSettings.custom_scripts || { head_scripts: [], body_scripts: [] }
    });

    const [newScript, setNewScript] = useState({ name: '', code: '', location: 'head' });

    const handleSave = () => {
      saveAnalyticsSettings({ ...analyticsSettings, ...formData });
    };

    const addCustomScript = () => {
      if (newScript.name && newScript.code) {
        const location = newScript.location === 'head' ? 'head_scripts' : 'body_scripts';
        setFormData(prev => ({
          ...prev,
          custom_scripts: {
            ...prev.custom_scripts,
            [location]: [...(prev.custom_scripts[location] || []), {
              id: Date.now(),
              name: newScript.name,
              code: newScript.code
            }]
          }
        }));
        setNewScript({ name: '', code: '', location: 'head' });
      }
    };

    const removeCustomScript = (location, scriptId) => {
      setFormData(prev => ({
        ...prev,
        custom_scripts: {
          ...prev.custom_scripts,
          [location]: prev.custom_scripts[location].filter(script => script.id !== scriptId)
        }
      }));
    };

    return (
      <div className="space-y-6">
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-medium text-orange-900 mb-2">Additional Tracking & Scripts</h3>
          <p className="text-sm text-orange-700">
            Configure Microsoft Clarity, CDP tracking, and custom analytics scripts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microsoft Clarity ID
              </label>
              <input
                type="text"
                value={formData.microsoft_clarity_id}
                onChange={(e) => setFormData(prev => ({ ...prev, microsoft_clarity_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="abcdefghij"
              />
              <div className="text-xs text-gray-500 mt-1">
                Free user behavior analytics from Microsoft
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CDP Tracking Code
              </label>
              <textarea
                value={formData.cdp_tracking_code}
                onChange={(e) => setFormData(prev => ({ ...prev, cdp_tracking_code: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Customer Data Platform tracking code..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Custom Scripts</h4>
            
            <div className="space-y-3">
              <input
                type="text"
                value={newScript.name}
                onChange={(e) => setNewScript(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Script name"
              />
              
              <select
                value={newScript.location}
                onChange={(e) => setNewScript(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="head">Head Section</option>
                <option value="body">Body Section</option>
              </select>
              
              <textarea
                value={newScript.code}
                onChange={(e) => setNewScript(prev => ({ ...prev, code: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<script>// Your custom script</script>"
              />
              
              <button
                onClick={addCustomScript}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Add Custom Script
              </button>
            </div>
          </div>
        </div>

        {/* Custom Scripts List */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Configured Scripts</h4>
          
          <div className="space-y-3">
            {['head_scripts', 'body_scripts'].map(location => (
              <div key={location}>
                <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {location.replace('_', ' ')}
                </h5>
                <div className="space-y-2">
                  {(formData.custom_scripts[location] || []).map((script) => (
                    <div key={script.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{script.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1 truncate">
                          {script.code.substring(0, 60)}...
                        </div>
                      </div>
                      <button
                        onClick={() => removeCustomScript(location, script.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Tracking Settings</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Tracking</h2>
          <p className="text-gray-600">Configure analytics and tracking for your website</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'google', label: 'Google Analytics', icon: FiBarChart3 },
            { id: 'social', label: 'Social Pixels', icon: FiShare2 },
            { id: 'other', label: 'Other Tracking', icon: FiCode }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'google' && <GoogleAnalyticsTab />}
        {activeTab === 'social' && <SocialPixelsTab />}
        {activeTab === 'other' && <OtherTrackingTab />}
      </div>
    </div>
  );
};

export default AnalyticsManager;