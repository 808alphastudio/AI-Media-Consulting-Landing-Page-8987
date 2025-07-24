import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const {
  FiMail, FiSettings, FiSend, FiEdit3, FiTrash2, FiPlus, FiEye,
  FiCheck, FiX, FiClock, FiBarChart3, FiAlertCircle, FiSave,
  FiRefreshCw, FiToggleLeft, FiToggleRight, FiCode, FiFileText
} = FiIcons;

const EmailManager = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [emailSettings, setEmailSettings] = useState({});
  const [emailLogs, setEmailLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    setIsLoading(true);
    try {
      // Load templates
      const { data: templatesData } = await supabase
        .from('email_templates_admin_sys')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Load settings
      const { data: settingsData } = await supabase
        .from('email_settings_admin_sys')
        .select('*')
        .eq('is_active', true)
        .single();
      
      // Load recent logs
      const { data: logsData } = await supabase
        .from('email_logs_admin_sys')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      setTemplates(templatesData || []);
      setEmailSettings(settingsData || {});
      setEmailLogs(logsData || []);
    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const TemplateEditor = ({ template, onSave, onClose }) => {
    const [formData, setFormData] = useState({
      name: template?.name || '',
      type: template?.type || 'custom',
      subject: template?.subject || '',
      html_content: template?.html_content || '',
      markdown_content: template?.markdown_content || '',
      text_content: template?.text_content || '',
      status: template?.status || 'draft'
    });

    const handleSave = async () => {
      try {
        if (template?.id) {
          await supabase
            .from('email_templates_admin_sys')
            .update({ ...formData, updated_at: new Date().toISOString() })
            .eq('id', template.id);
        } else {
          await supabase
            .from('email_templates_admin_sys')
            .insert([formData]);
        }
        onSave();
        loadEmailData();
      } catch (error) {
        console.error('Error saving template:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {template?.id ? 'Edit Template' : 'Create Template'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation_confirmation">Consultation Confirmation</option>
                  <option value="consultation_reminder">Consultation Reminder</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Use {{variables}} for dynamic content"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content
                </label>
                <textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="HTML email content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Markdown Content
                </label>
                <textarea
                  value={formData.markdown_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, markdown_content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Markdown content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Content
                </label>
                <textarea
                  value={formData.text_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Plain text fallback..."
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  />
                  <span className="text-sm">Draft</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmailSettingsModal = ({ onClose }) => {
    const [settings, setSettings] = useState({
      provider: emailSettings.provider || 'mailgun',
      api_key: emailSettings.api_key || '',
      domain: emailSettings.domain || '',
      from_email: emailSettings.from_email || 'guy@tasakadigital.com',
      from_name: emailSettings.from_name || 'Guy Tasaka',
      is_active: emailSettings.is_active || false
    });

    const handleSave = async () => {
      try {
        if (emailSettings.id) {
          await supabase
            .from('email_settings_admin_sys')
            .update({ ...settings, updated_at: new Date().toISOString() })
            .eq('id', emailSettings.id);
        } else {
          await supabase
            .from('email_settings_admin_sys')
            .insert([settings]);
        }
        loadEmailData();
        onClose();
      } catch (error) {
        console.error('Error saving email settings:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Provider Settings</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Provider
              </label>
              <select
                value={settings.provider}
                onChange={(e) => setSettings(prev => ({ ...prev, provider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="mailgun">Mailgun</option>
                <option value="sendgrid">SendGrid</option>
                <option value="amazon_ses">Amazon SES</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.api_key}
                  onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  value={settings.domain}
                  onChange={(e) => setSettings(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, from_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.from_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, from_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.is_active}
                  onChange={(e) => setSettings(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm font-medium">Enable Email Sending</span>
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Management</h2>
          <p className="text-gray-600">Manage email templates, settings, and delivery</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiSettings} className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'templates', label: 'Templates', icon: FiFileText },
            { id: 'logs', label: 'Email Logs', icon: FiBarChart3 },
            { id: 'triggers', label: 'Triggers', icon: FiClock }
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

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{template.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {template.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : template.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(template.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                          <SafeIcon icon={FiEye} className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{log.recipient_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">{log.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : log.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : log.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <SafeIcon icon={FiClock} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Email Triggers</h3>
            <p className="text-gray-500">Configure automated email triggers based on user actions</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Create Trigger
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showTemplateModal && (
        <TemplateEditor
          template={selectedTemplate}
          onSave={() => {
            setShowTemplateModal(false);
            setSelectedTemplate(null);
          }}
          onClose={() => {
            setShowTemplateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showSettingsModal && (
        <EmailSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
};

export default EmailManager;