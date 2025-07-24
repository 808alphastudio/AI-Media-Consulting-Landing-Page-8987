import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';
import supabase from '../lib/supabase';

const {
  FiEdit3, FiPlus, FiSearch, FiFileText, FiMic, FiShare2, FiVideo,
  FiGlobe, FiCalendar, FiSave, FiX, FiExternalLink, FiTrash2, FiBarChart3
} = FiIcons;

const AuthorityContent = () => {
  const [contentList, setContentList] = useState([]);
  const [contentFilter, setContentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewContentModal, setShowNewContentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentStats, setContentStats] = useState({
    articles: 0,
    speaking: 0,
    social: 0,
    podcast: 0,
    totalViews: 0,
    totalLeads: 0,
    totalConversions: 0
  });

  const [newContent, setNewContent] = useState({
    title: '',
    type: 'article',
    platform: '',
    status: 'draft',
    scheduled_date: '',
    published_date: '',
    views: 0,
    engagement: 0,
    leads: 0,
    conversions: 0,
    url: '',
    notes: '',
    expected_attendees: 0,
    expected_listeners: 0,
    content: ''
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('authority_content_admin_sys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setContentList(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Error loading content:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      articles: data.filter(item => item.type === 'article').length,
      speaking: data.filter(item => item.type === 'speaking').length,
      social: data.filter(item => item.type === 'social').length,
      podcast: data.filter(item => item.type === 'podcast').length,
      totalViews: data.reduce((sum, item) => sum + (item.views || 0), 0),
      totalLeads: data.reduce((sum, item) => sum + (item.leads || 0), 0),
      totalConversions: data.reduce((sum, item) => sum + (item.conversions || 0), 0)
    };
    setContentStats(stats);
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const contentData = { ...newContent };
      
      // Format dates properly for database
      if (contentData.scheduled_date) {
        contentData.scheduled_date = new Date(contentData.scheduled_date).toISOString();
      }
      
      if (contentData.published_date) {
        contentData.published_date = new Date(contentData.published_date).toISOString();
      }

      if (selectedContent?.id) {
        // Update existing content
        const { data, error } = await supabase
          .from('authority_content_admin_sys')
          .update(contentData)
          .eq('id', selectedContent.id)
          .select();

        if (error) throw error;
      } else {
        // Insert new content
        const { data, error } = await supabase
          .from('authority_content_admin_sys')
          .insert([contentData])
          .select();

        if (error) throw error;
      }
      
      // Create activity entry for content creation/update
      await supabase
        .from('activity_feed_admin_sys')
        .insert([{
          type: selectedContent?.id ? 'content_updated' : 'content_created',
          title: selectedContent?.id ? 'Content updated' : 'New content created',
          description: `${selectedContent?.id ? 'Updated' : 'Created'} ${contentData.type}: ${contentData.title}`,
          icon: contentData.type === 'article' ? 'FiFileText' : 
                contentData.type === 'speaking' ? 'FiMic' : 
                contentData.type === 'social' ? 'FiShare2' : 'FiVideo',
          color: 'blue'
        }]);
      
      // Reset form and reload content
      setShowNewContentModal(false);
      setSelectedContent(null);
      resetForm();
      loadContent();
      
    } catch (err) {
      console.error("Error saving content:", err);
      alert("Failed to save content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const { error } = await supabase
        .from('authority_content_admin_sys')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Create activity for deletion
      await supabase
        .from('activity_feed_admin_sys')
        .insert([{
          type: 'content_deleted',
          title: 'Content deleted',
          description: 'A content item was permanently deleted',
          icon: 'FiTrash2',
          color: 'red'
        }]);
        
      loadContent();
    } catch (err) {
      console.error("Error deleting content:", err);
      alert("Failed to delete content");
    }
  };

  const resetForm = () => {
    setNewContent({
      title: '',
      type: 'article',
      platform: '',
      status: 'draft',
      scheduled_date: '',
      published_date: '',
      views: 0,
      engagement: 0,
      leads: 0,
      conversions: 0,
      url: '',
      notes: '',
      expected_attendees: 0,
      expected_listeners: 0,
      content: ''
    });
  };

  const editContent = (content) => {
    // Format dates for form inputs
    const formattedContent = {
      ...content,
      scheduled_date: content.scheduled_date ? new Date(content.scheduled_date).toISOString().split('T')[0] : '',
      published_date: content.published_date ? new Date(content.published_date).toISOString().split('T')[0] : ''
    };
    
    setNewContent(formattedContent);
    setSelectedContent(content);
    setShowNewContentModal(true);
  };

  // Filter content based on search term and content type filter
  const filteredContent = contentList.filter(content => {
    const searchMatch = content.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       content.platform?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = contentFilter === 'all' || content.type === contentFilter;
    
    return searchMatch && typeMatch;
  });

  // Content performance chart data
  const contentPerformanceChart = {
    title: {
      text: 'Authority Content Performance',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Views', 'Engagement', 'Leads Generated'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Articles', 'Speaking', 'Social Posts', 'Podcasts']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Views',
        type: 'bar',
        data: [
          contentList.filter(c => c.type === 'article').reduce((sum, c) => sum + (c.views || 0), 0),
          contentList.filter(c => c.type === 'speaking').reduce((sum, c) => sum + (c.expected_attendees || 0), 0),
          contentList.filter(c => c.type === 'social').reduce((sum, c) => sum + (c.views || 0), 0),
          contentList.filter(c => c.type === 'podcast').reduce((sum, c) => sum + (c.expected_listeners || 0), 0)
        ]
      },
      {
        name: 'Engagement',
        type: 'bar',
        data: [
          contentList.filter(c => c.type === 'article').reduce((sum, c) => sum + (c.engagement || 0), 0),
          contentList.filter(c => c.type === 'speaking').reduce((sum, c) => sum + (Math.floor((c.expected_attendees || 0) * 0.2)), 0),
          contentList.filter(c => c.type === 'social').reduce((sum, c) => sum + (c.engagement || 0), 0),
          contentList.filter(c => c.type === 'podcast').reduce((sum, c) => sum + (Math.floor((c.expected_listeners || 0) * 0.1)), 0)
        ]
      },
      {
        name: 'Leads Generated',
        type: 'line',
        yAxisIndex: 0,
        data: [
          contentList.filter(c => c.type === 'article').reduce((sum, c) => sum + (c.leads || 0), 0),
          contentList.filter(c => c.type === 'speaking').reduce((sum, c) => sum + (c.leads || 0), 0),
          contentList.filter(c => c.type === 'social').reduce((sum, c) => sum + (c.leads || 0), 0),
          contentList.filter(c => c.type === 'podcast').reduce((sum, c) => sum + (c.leads || 0), 0)
        ]
      }
    ]
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Authority Content Management</h2>
          <p className="text-gray-600 mt-1">Manage your thought leadership content across all platforms</p>
        </div>
        <div className="flex flex-wrap items-center space-x-3 gap-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiSearch} className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Content</option>
            <option value="article">Articles</option>
            <option value="speaking">Speaking</option>
            <option value="social">Social Posts</option>
            <option value="podcast">Podcasts</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setSelectedContent(null);
              setShowNewContentModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{contentStats.totalViews}</div>
          <div className="text-sm text-blue-600">Total Views/Attendees</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{contentStats.totalLeads}</div>
          <div className="text-sm text-green-600">Leads Generated</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{contentStats.totalConversions}</div>
          <div className="text-sm text-purple-600">Conversions</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{contentList.length}</div>
          <div className="text-sm text-yellow-600">Total Content Pieces</div>
        </div>
      </div>

      {/* Content Performance Chart */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl mb-8">
        <ReactECharts option={contentPerformanceChart} style={{ height: '300px' }} />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No content found</p>
            <button
              onClick={() => {
                resetForm();
                setSelectedContent(null);
                setShowNewContentModal(true);
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create Your First Content
            </button>
          </div>
        ) : (
          filteredContent.map((content) => (
            <div key={content.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      content.type === 'article' ? 'bg-blue-100' :
                      content.type === 'speaking' ? 'bg-purple-100' :
                      content.type === 'social' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      <SafeIcon
                        icon={
                          content.type === 'article' ? FiFileText :
                          content.type === 'speaking' ? FiMic :
                          content.type === 'social' ? FiShare2 :
                          FiVideo
                        }
                        className={`w-5 h-5 ${
                          content.type === 'article' ? 'text-blue-600' :
                          content.type === 'speaking' ? 'text-purple-600' :
                          content.type === 'social' ? 'text-green-600' :
                          'text-yellow-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{content.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <SafeIcon icon={FiGlobe} className="w-3.5 h-3.5" />
                          <span>{content.platform}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <SafeIcon icon={FiCalendar} className="w-3.5 h-3.5" />
                          <span>
                            {content.published_date
                              ? format(new Date(content.published_date), 'MMM dd, yyyy')
                              : content.scheduled_date
                                ? `Scheduled: ${format(new Date(content.scheduled_date), 'MMM dd, yyyy')}`
                                : 'Draft'
                            }
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {content.views || content.expected_attendees || content.expected_listeners || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {content.views ? 'Views' : content.expected_attendees ? 'Expected Attendees' : 'Expected Listeners'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">{content.engagement || 0}</div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">{content.leads || 0}</div>
                      <div className="text-xs text-gray-500">Leads Generated</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{content.conversions || 0}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                  </div>

                  {/* Notes */}
                  {content.notes && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">{content.notes}</p>
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end space-y-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    content.status === 'published' ? 'bg-green-100 text-green-800' :
                    content.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {content.status}
                  </span>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => editContent(content)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Edit content"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                    </button>
                    {content.url && (
                      <a 
                        href={content.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View content"
                      >
                        <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Share content"
                    >
                      <SafeIcon icon={FiShare2} className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteContent(content.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete content"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New/Edit Content Modal */}
      {showNewContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedContent ? 'Edit Content' : 'Create New Content'}
                </h3>
                <button
                  onClick={() => setShowNewContentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleContentSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter content title..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="article">Article</option>
                    <option value="speaking">Speaking Engagement</option>
                    <option value="social">Social Media Post</option>
                    <option value="podcast">Podcast</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <input
                    type="text"
                    value={newContent.platform}
                    onChange={(e) => setNewContent(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LinkedIn, Editor & Publisher, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newContent.content}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your content here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL (if published)</label>
                  <input
                    type="url"
                    value={newContent.url || ''}
                    onChange={(e) => setNewContent(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newContent.status}
                    onChange={(e) => setNewContent(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {newContent.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                    <input
                      type="date"
                      value={newContent.scheduled_date}
                      onChange={(e) => setNewContent(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                {newContent.status === 'published' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
                    <input
                      type="date"
                      value={newContent.published_date}
                      onChange={(e) => setNewContent(prev => ({ ...prev, published_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newContent.notes || ''}
                  onChange={(e) => setNewContent(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this content..."
                />
              </div>

              {/* Content-specific metrics */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(newContent.type === 'article' || newContent.type === 'social') && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Views</label>
                        <input
                          type="number"
                          value={newContent.views || 0}
                          onChange={(e) => setNewContent(prev => ({ ...prev, views: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Engagement</label>
                        <input
                          type="number"
                          value={newContent.engagement || 0}
                          onChange={(e) => setNewContent(prev => ({ ...prev, engagement: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                  
                  {newContent.type === 'speaking' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Expected Attendees</label>
                      <input
                        type="number"
                        value={newContent.expected_attendees || 0}
                        onChange={(e) => setNewContent(prev => ({ ...prev, expected_attendees: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  
                  {newContent.type === 'podcast' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Expected Listeners</label>
                      <input
                        type="number"
                        value={newContent.expected_listeners || 0}
                        onChange={(e) => setNewContent(prev => ({ ...prev, expected_listeners: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Leads Generated</label>
                    <input
                      type="number"
                      value={newContent.leads || 0}
                      onChange={(e) => setNewContent(prev => ({ ...prev, leads: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Conversions</label>
                    <input
                      type="number"
                      value={newContent.conversions || 0}
                      onChange={(e) => setNewContent(prev => ({ ...prev, conversions: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewContentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiSave} className="w-4 h-4" />
                      <span>{selectedContent ? 'Update Content' : 'Create Content'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityContent;