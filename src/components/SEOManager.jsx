import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const {
  FiSearch, FiGlobe, FiShare2, FiCode, FiFileText, FiDownload,
  FiEye, FiSave, FiRefreshCw, FiExternalLink, FiImage, FiSettings
} = FiIcons;

const SEOManager = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [seoSettings, setSeoSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('google');
  const [sitemapUrls, setSitemapUrls] = useState([]);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  const loadSEOSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('seo_settings_admin_sys')
        .select('*')
        .single();
      
      if (data) {
        setSeoSettings(data);
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSEOSettings = async (updatedSettings) => {
    try {
      if (seoSettings.id) {
        await supabase
          .from('seo_settings_admin_sys')
          .update({ ...updatedSettings, updated_at: new Date().toISOString() })
          .eq('id', seoSettings.id);
      } else {
        await supabase
          .from('seo_settings_admin_sys')
          .insert([updatedSettings]);
      }
      
      setSeoSettings(updatedSettings);
      alert('SEO settings saved successfully!');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('Error saving SEO settings');
    }
  };

  const generateSitemap = async () => {
    try {
      // Generate sitemap URLs
      const baseUrls = [
        { url: '/', priority: '1.0', changefreq: 'weekly' },
        { url: '/admin', priority: '0.3', changefreq: 'monthly' }
      ];

      // Add consultation URLs if needed
      const { data: consultations } = await supabase
        .from('consultations_booking_sys')
        .select('id, created_at')
        .eq('status', 'confirmed');

      setSitemapUrls(baseUrls);
      
      // Generate XML
      const sitemapXML = generateSitemapXML(baseUrls);
      
      // Download sitemap
      const blob = new Blob([sitemapXML], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating sitemap:', error);
    }
  };

  const generateSitemapXML = (urls) => {
    const baseUrl = seoSettings.canonical_url || 'https://tasakadigital.com';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  };

  const BasicSEOTab = () => {
    const [formData, setFormData] = useState({
      site_title: seoSettings.site_title || '',
      site_description: seoSettings.site_description || '',
      keywords: seoSettings.keywords || '',
      canonical_url: seoSettings.canonical_url || '',
      robots_txt: seoSettings.robots_txt || ''
    });

    const handleSave = () => {
      saveSEOSettings({ ...seoSettings, ...formData });
    };

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={formData.site_title}
            onChange={(e) => setFormData(prev => ({ ...prev, site_title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Your site title - appears in browser tabs and search results"
          />
          <div className="text-xs text-gray-500 mt-1">
            Recommended: 50-60 characters | Current: {formData.site_title.length}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
          </label>
          <textarea
            value={formData.site_description}
            onChange={(e) => setFormData(prev => ({ ...prev, site_description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of your site - appears in search results"
          />
          <div className="text-xs text-gray-500 mt-1">
            Recommended: 150-160 characters | Current: {formData.site_description.length}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="keyword1, keyword2, keyword3"
          />
          <div className="text-xs text-gray-500 mt-1">
            Separate keywords with commas
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canonical URL
          </label>
          <input
            type="url"
            value={formData.canonical_url}
            onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourdomain.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Robots.txt Content
          </label>
          <textarea
            value={formData.robots_txt}
            onChange={(e) => setFormData(prev => ({ ...prev, robots_txt: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://yourdomain.com/sitemap.xml"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Basic SEO</span>
        </button>
      </div>
    );
  };

  const SocialCardsTab = () => {
    const [formData, setFormData] = useState({
      og_title: seoSettings.og_title || '',
      og_description: seoSettings.og_description || '',
      og_image: seoSettings.og_image || '',
      og_type: seoSettings.og_type || 'website',
      twitter_card: seoSettings.twitter_card || 'summary_large_image',
      twitter_site: seoSettings.twitter_site || '',
      twitter_creator: seoSettings.twitter_creator || ''
    });

    const handleSave = () => {
      saveSEOSettings({ ...seoSettings, ...formData });
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Open Graph (Facebook, LinkedIn)</h3>
          <p className="text-sm text-blue-700">
            Controls how your site appears when shared on social media platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Title
              </label>
              <input
                type="text"
                value={formData.og_title}
                onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Title for social media shares"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Description
              </label>
              <textarea
                value={formData.og_description}
                onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description for social media shares"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Image URL
              </label>
              <input
                type="url"
                value={formData.og_image}
                onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourdomain.com/og-image.jpg"
              />
              <div className="text-xs text-gray-500 mt-1">
                Recommended size: 1200x630px
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Card Type
              </label>
              <select
                value={formData.twitter_card}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter_card: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="app">App</option>
                <option value="player">Player</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Site (@username)
              </label>
              <input
                type="text"
                value={formData.twitter_site}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter_site: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="@yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Creator (@username)
              </label>
              <input
                type="text"
                value={formData.twitter_creator}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter_creator: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="@creatorusername"
              />
            </div>
          </div>
        </div>

        {/* Social Media Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
            {formData.og_image && (
              <img
                src={formData.og_image}
                alt="OG Preview"
                className="w-full h-32 object-cover rounded mb-3"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="font-medium text-gray-900 text-sm mb-1">
              {formData.og_title || 'Your page title'}
            </div>
            <div className="text-gray-600 text-xs mb-2">
              {formData.og_description || 'Your page description'}
            </div>
            <div className="text-gray-400 text-xs">
              {seoSettings.canonical_url || 'yourdomain.com'}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Social Cards</span>
        </button>
      </div>
    );
  };

  const SchemaMarkupTab = () => {
    const [schemaData, setSchemaData] = useState(
      JSON.stringify(seoSettings.schema_markup || {}, null, 2)
    );

    const handleSave = () => {
      try {
        const parsedSchema = JSON.parse(schemaData);
        saveSEOSettings({ ...seoSettings, schema_markup: parsedSchema });
      } catch (error) {
        alert('Invalid JSON format. Please check your schema markup.');
      }
    };

    const generateBusinessSchema = () => {
      const businessSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Tasaka Digital",
        "description": "AI Media Consulting and Strategy Services",
        "url": seoSettings.canonical_url || "https://tasakadigital.com",
        "telephone": "+1-555-0123",
        "email": "guy@tasakadigital.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Pacific Northwest",
          "addressCountry": "US"
        },
        "provider": {
          "@type": "Person",
          "name": "Guy Tasaka",
          "jobTitle": "AI Media Consultant",
          "award": "LMA Innovator of the Year"
        },
        "serviceType": [
          "AI Consulting",
          "Media Strategy",
          "Digital Transformation"
        ],
        "areaServed": {
          "@type": "Place",
          "name": "Global"
        }
      };

      setSchemaData(JSON.stringify(businessSchema, null, 2));
    };

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Schema.org Structured Data</h3>
          <p className="text-sm text-green-700">
            Help search engines understand your content better with structured data markup
          </p>
        </div>

        <div className="flex space-x-3 mb-4">
          <button
            onClick={generateBusinessSchema}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            Generate Business Schema
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
            Validate Schema
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON-LD Schema Markup
          </label>
          <textarea
            value={schemaData}
            onChange={(e) => setSchemaData(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter your JSON-LD schema markup here..."
          />
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Common Schema Types</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Organization/Business</li>
            <li>• Person/Professional</li>
            <li>• Service</li>
            <li>• Article/BlogPosting</li>
            <li>• Event</li>
            <li>• Review/Rating</li>
          </ul>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>Save Schema Markup</span>
        </button>
      </div>
    );
  };

  const SitemapTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-2">XML Sitemap Generation</h3>
          <p className="text-sm text-purple-700">
            Generate and manage your site's XML sitemap for search engines
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sitemap Settings</h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm">Include main pages</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Include consultation pages</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm">Include blog posts</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="daily">Daily</option>
                <option value="weekly" selected>Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sitemap URLs ({sitemapUrls.length})</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {sitemapUrls.length > 0 ? (
                <div className="space-y-2">
                  {sitemapUrls.map((url, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{url.url}</span>
                      <span className="text-gray-500">{url.priority}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No URLs generated yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={generateSitemap}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>Generate & Download Sitemap</span>
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            <span>Refresh URLs</span>
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Sitemap Submission</h4>
          <p className="text-sm text-gray-600 mb-3">
            Submit your sitemap to search engines for better indexing
          </p>
          <div className="flex space-x-3">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2"
            >
              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
              <span>Google Search Console</span>
            </a>
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm flex items-center space-x-2"
            >
              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
              <span>Bing Webmaster</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Management</h2>
          <p className="text-gray-600">Optimize your site for search engines and social media</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <SafeIcon icon={FiEye} className="w-4 h-4" />
            <span>Preview Site</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            <span>SEO Audit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic SEO', icon: FiSearch },
            { id: 'social', label: 'Social Cards', icon: FiShare2 },
            { id: 'schema', label: 'Schema Markup', icon: FiCode },
            { id: 'sitemap', label: 'Sitemap', icon: FiGlobe }
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
        {activeTab === 'basic' && <BasicSEOTab />}
        {activeTab === 'social' && <SocialCardsTab />}
        {activeTab === 'schema' && <SchemaMarkupTab />}
        {activeTab === 'sitemap' && <SitemapTab />}
      </div>
    </div>
  );
};

export default SEOManager;