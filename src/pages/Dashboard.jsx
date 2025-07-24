import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useSupabase } from '../hooks/useSupabase';

const {
  FiUsers, FiTrendingUp, FiCalendar, FiMail, FiGlobe, FiAward, FiBarChart3,
  FiTarget, FiDollarSign, FiClock, FiEdit3, FiPlus, FiFilter, FiDownload,
  FiEye, FiLogOut, FiSettings, FiHome, FiBell, FiZap, FiSearch, FiMoreHorizontal,
  FiPhone, FiExternalLink, FiFileText, FiActivity, FiRefreshCw, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiUser, FiDatabase, FiMonitor, FiShield, FiMenu,
  FiX, FiChevronLeft, FiChevronRight, FiSave, FiUpload, FiTrash2, FiEdit,
  FiSend, FiLinkedin, FiGithub, FiTwitter, FiShare2, FiCopy, FiBookOpen,
  FiVideo, FiMic, FiPenTool, FiImage, FiLink, FiHeart, FiMessageSquare,
  FiThumbsUp, FiPlay, FiPause, FiStop, FiSkipBack, FiSkipForward
} = FiIcons;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [notifications, setNotifications] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [consultationStats, setConsultationStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalValue: 0
  });

  // Content Management State
  const [contentFilter, setContentFilter] = useState('all');
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'article',
    platform: 'linkedin',
    content: '',
    scheduledDate: '',
    status: 'draft'
  });
  const [showNewContentModal, setShowNewContentModal] = useState(false);

  // Settings State
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

  const navigate = useNavigate();
  const { isConnected, isLoading: supabaseLoading, error: supabaseError, getConsultations, updateConsultationStatus } = useSupabase();

  // Load consultations on component mount
  useEffect(() => {
    if (isConnected) {
      loadConsultations();
    }
  }, [isConnected]);

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getConsultations();
      if (data) {
        setConsultations(data);
        calculateStats(data);
      }
      if (error) {
        console.error('Error loading consultations:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(c => c.status === 'pending').length,
      confirmed: data.filter(c => c.status === 'confirmed').length,
      completed: data.filter(c => c.status === 'completed').length,
      totalValue: data.reduce((sum, c) => sum + (c.estimated_value || 0), 0)
    };
    setConsultationStats(stats);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  // Handle consultation status update
  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      const { data, error } = await updateConsultationStatus(consultationId, newStatus);
      if (data && !error) {
        loadConsultations();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Mock data for authority content
  const authorityContent = [
    {
      id: 1,
      title: "AI-Enabled Media 3.0: The Future of News Production",
      type: "article",
      platform: "Editor & Publisher",
      status: "published",
      publishedDate: "2024-01-15",
      views: 2847,
      engagement: 156,
      leads: 12,
      conversions: 3,
      url: "https://editorandpublisher.com/ai-enabled-media-3.0"
    },
    {
      id: 2,
      title: "Transforming Newsrooms with AI Automation",
      type: "speaking",
      platform: "NAB Show 2024",
      status: "scheduled",
      scheduledDate: "2024-02-20",
      expectedAttendees: 500,
      leads: 0,
      conversions: 0,
      notes: "Keynote presentation on AI implementation strategies"
    },
    {
      id: 3,
      title: "LinkedIn Post: 5 AI Tools Every Media Executive Should Know",
      type: "social",
      platform: "LinkedIn",
      status: "published",
      publishedDate: "2024-01-12",
      views: 8420,
      engagement: 342,
      leads: 8,
      conversions: 2,
      url: "https://linkedin.com/posts/guy-tasaka/ai-tools"
    },
    {
      id: 4,
      title: "Podcast: The AI Revolution in Broadcasting",
      type: "podcast",
      platform: "Media Innovation Podcast",
      status: "scheduled",
      scheduledDate: "2024-01-25",
      expectedListeners: 1200,
      leads: 0,
      conversions: 0,
      notes: "60-minute interview on AI trends"
    }
  ];

  // Mock activity data
  const activityFeed = [
    {
      id: 1,
      type: "consultation_booked",
      title: "New consultation request",
      description: "Sarah Chen from Pacific Media Group booked a consultation",
      timestamp: "2024-01-15T10:30:00Z",
      icon: FiCalendar,
      color: "blue",
      actionable: true,
      consultationId: "CONS-123"
    },
    {
      id: 2,
      type: "content_published",
      title: "Article published",
      description: "AI-Enabled Media 3.0 article went live on Editor & Publisher",
      timestamp: "2024-01-15T09:00:00Z",
      icon: FiEdit3,
      color: "green",
      actionable: false,
      metrics: { views: 2847, engagement: 156 }
    },
    {
      id: 3,
      type: "lead_converted",
      title: "Lead converted to client",
      description: "Michael Rodriguez confirmed $75K AI implementation project",
      timestamp: "2024-01-14T16:45:00Z",
      icon: FiDollarSign,
      color: "purple",
      actionable: false,
      value: 75000
    },
    {
      id: 4,
      type: "speaking_confirmed",
      title: "Speaking engagement confirmed",
      description: "NAB Show 2024 keynote presentation confirmed",
      timestamp: "2024-01-14T11:20:00Z",
      icon: FiAward,
      color: "yellow",
      actionable: false,
      event: "NAB Show 2024"
    },
    {
      id: 5,
      type: "consultation_completed",
      title: "Consultation completed",
      description: "60-minute AI strategy session with Emma Thompson completed",
      timestamp: "2024-01-13T14:00:00Z",
      icon: FiCheckCircle,
      color: "green",
      actionable: true,
      followUp: true
    }
  ];

  // Content performance chart data
  const contentPerformanceChart = {
    title: {
      text: 'Authority Content Performance (Last 30 Days)',
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
      data: ['Articles', 'Speaking', 'Social Posts', 'Podcasts', 'Webinars']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Views',
        type: 'bar',
        data: [2847, 500, 8420, 1200, 850]
      },
      {
        name: 'Engagement',
        type: 'bar',
        data: [156, 45, 342, 89, 67]
      },
      {
        name: 'Leads Generated',
        type: 'line',
        yAxisIndex: 0,
        data: [12, 25, 8, 15, 10]
      }
    ]
  };

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'consultations', label: 'Consultations', icon: FiCalendar },
    { id: 'leads', label: 'Lead Management', icon: FiUsers },
    { id: 'performance', label: 'Analytics', icon: FiBarChart3 },
    { id: 'content', label: 'Authority Content', icon: FiEdit3 },
    { id: 'activity', label: 'Activity', icon: FiActivity },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  // Mock data for demonstration (keeping existing for other sections)
  const leadData = [
    {
      id: 1,
      name: "Sarah Chen",
      company: "Pacific Media Group",
      title: "News Director",
      email: "s.chen@pacificmedia.com",
      phone: "+1 (555) 123-4567",
      industry: "Broadcasting",
      companySize: "50-100",
      urgency: "High",
      consultationDate: "2024-01-15",
      status: "Scheduled",
      notes: "Interested in AI content automation for newsroom operations",
      source: "Speaking Engagement",
      lastContact: "2024-01-10",
      value: "$75,000",
      probability: "85%"
    }
  ];

  const conversionData = {
    title: {
      text: 'Lead Conversion Funnel',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    series: [{
      name: 'Conversion',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}: {c}%'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      data: [
        { value: 100, name: 'Website Visitors' },
        { value: 45, name: 'Consultation Requests' },
        { value: 35, name: 'Qualified Leads' },
        { value: 28, name: 'Consultations Completed' },
        { value: 22, name: 'Proposals Sent' },
        { value: 18, name: 'Clients Converted' }
      ]
    }]
  };

  const performanceData = {
    title: {
      text: 'Monthly Performance Metrics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['Consultations', 'Conversions', 'Revenue ($K)'],
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
      boundaryGap: false,
      data: ['Oct', 'Nov', 'Dec', 'Jan']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: 'Consultations',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 3
        },
        emphasis: {
          focus: 'series'
        },
        data: [12, 18, 25, consultationStats.total]
      },
      {
        name: 'Conversions',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 3
        },
        emphasis: {
          focus: 'series'
        },
        data: [8, 12, 18, consultationStats.confirmed]
      },
      {
        name: 'Revenue ($K)',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        data: [45, 68, 95, Math.round(consultationStats.totalValue / 1000)]
      }
    ]
  };

  const keyMetrics = [
    {
      label: "Total Consultations",
      value: consultationStats.total.toString(),
      change: "+28%",
      icon: FiCalendar,
      color: "blue",
      trend: "up",
      description: "All consultation requests"
    },
    {
      label: "Confirmed Rate",
      value: consultationStats.total > 0 ? `${Math.round((consultationStats.confirmed / consultationStats.total) * 100)}%` : "0%",
      change: "+12%",
      icon: FiTrendingUp,
      color: "green",
      trend: "up",
      description: "Consultation confirmation rate"
    },
    {
      label: "Pipeline Value",
      value: `$${Math.round(consultationStats.totalValue / 1000)}K`,
      change: "+32%",
      icon: FiDollarSign,
      color: "purple",
      trend: "up",
      description: "Total estimated pipeline value"
    },
    {
      label: "Pending Reviews",
      value: consultationStats.pending.toString(),
      change: "+3",
      icon: FiClock,
      color: "orange",
      trend: "up",
      description: "Consultations awaiting review"
    }
  ];

  // Get upcoming consultations from real data
  const upcomingConsultations = consultations
    .filter(c => c.status === 'confirmed' || c.status === 'pending')
    .sort((a, b) => new Date(a.preferred_date) - new Date(b.preferred_date))
    .slice(0, 5)
    .map(consultation => ({
      id: consultation.id,
      name: `${consultation.first_name} ${consultation.last_name}`,
      company: consultation.company,
      time: consultation.preferred_time,
      date: format(new Date(consultation.preferred_date), 'MMM dd'),
      type: "AI Strategy Session",
      duration: "60 min",
      status: consultation.status
    }));

  const contentPerformance = [
    {
      type: "Speaking Engagements",
      leads: 45,
      conversions: 32,
      roi: "285%",
      trend: "up",
      events: 8
    },
    {
      type: "Editor & Publisher Column",
      leads: 28,
      conversions: 18,
      roi: "220%",
      trend: "up",
      events: 12
    },
    {
      type: "LinkedIn Content",
      leads: 22,
      conversions: 12,
      roi: "180%",
      trend: "stable",
      events: 24
    },
    {
      type: "Website SEO",
      leads: consultationStats.total,
      conversions: consultationStats.confirmed,
      roi: "165%",
      trend: "up",
      events: 0
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "consultation",
      message: "New consultation request received",
      time: "2 hours ago",
      icon: FiCheckCircle,
      color: "green"
    },
    {
      id: 2,
      type: "lead",
      message: `${consultationStats.pending} consultations pending review`,
      time: "4 hours ago",
      icon: FiUser,
      color: "blue"
    },
    {
      id: 3,
      type: "proposal",
      message: "Consultation confirmed with client",
      time: "1 day ago",
      icon: FiFileText,
      color: "purple"
    },
    {
      id: 4,
      type: "speaking",
      message: "Speaking engagement confirmed for AI Summit",
      time: "2 days ago",
      icon: FiAward,
      color: "yellow"
    }
  ];

  // Filter consultations based on search term and industry
  const filteredConsultations = consultations.filter(consultation => {
    const searchMatch = consultation.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const industryMatch = filterIndustry === 'all' || consultation.industry?.toLowerCase().includes(filterIndustry.toLowerCase());

    return searchMatch && industryMatch;
  });

  // Filter authority content
  const filteredContent = authorityContent.filter(content => {
    const searchMatch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.platform.toLowerCase().includes(searchTerm.toLowerCase());

    const typeMatch = contentFilter === 'all' || content.type === contentFilter;

    return searchMatch && typeMatch;
  });

  // Filter activity feed
  const filteredActivity = activityFeed.filter(activity => {
    return activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleBulkAction = (action) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log(`Performing ${action} on consultations:`, selectedLeads);
      setSelectedLeads([]);
      setIsLoading(false);
    }, 1000);
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Handle content creation
  const handleContentSubmit = (e) => {
    e.preventDefault();
    console.log('Creating new content:', newContent);
    setShowNewContentModal(false);
    setNewContent({
      title: '',
      type: 'article',
      platform: 'linkedin',
      content: '',
      scheduledDate: '',
      status: 'draft'
    });
  };

  // Handle settings update
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 hidden lg:flex`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiZap} className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Tasaka Digital</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <SafeIcon icon={sidebarCollapsed ? FiChevronRight : FiChevronLeft} className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Connection Status */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-t border-gray-200">
            <div className={`flex items-center space-x-2 text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Database Connected' : 'Database Offline'}</span>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">GT</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Guy Tasaka</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-1">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded"
            >
              <SafeIcon icon={FiExternalLink} className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>View Site</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-500 hover:text-red-600 rounded"
            >
              <SafeIcon icon={FiLogOut} className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white">
            {/* Mobile menu content - same as sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiZap} className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Tasaka Digital</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <SafeIcon icon={FiX} className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <SafeIcon icon={item.icon} className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back, Guy Tasaka</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                  <SafeIcon icon={FiBell} className="w-5 h-5 text-gray-500" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 hidden sm:inline">Last updated: 2 min ago</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {keyMetrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                            {metric.change}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">vs last month</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                        <SafeIcon icon={metric.icon} className={`w-6 h-6 text-${metric.color}-600`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <ReactECharts option={conversionData} style={{ height: '400px' }} />
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <ReactECharts option={performanceData} style={{ height: '400px' }} />
                </div>
              </div>

              {/* Recent Activity & Upcoming Consultations */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <SafeIcon icon={activity.icon} className={`w-4 h-4 text-${activity.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Consultations</h3>
                  <div className="space-y-4">
                    {upcomingConsultations.length > 0 ? upcomingConsultations.map((consultation, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{consultation.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{consultation.company}</div>
                            <div className="text-sm text-blue-600 mt-1">
                              {consultation.date} at {consultation.time} • {consultation.duration}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${consultation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : consultation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {consultation.status}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-8">
                        <SafeIcon icon={FiCalendar} className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No upcoming consultations</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Consultation Management</h2>
                  <p className="text-gray-600 mt-1">Manage consultation requests and bookings</p>
                </div>
                <div className="flex flex-wrap items-center space-x-3 gap-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiSearch} className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search consultations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                      value={filterIndustry}
                      onChange={(e) => setFilterIndustry(e.target.value)}
                      className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Industries</option>
                      <option value="broadcasting">Broadcasting</option>
                      <option value="digital">Digital Media</option>
                      <option value="publishing">Publishing</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <button
                    onClick={loadConsultations}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Consultation Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{consultationStats.total}</div>
                  <div className="text-sm text-blue-600">Total Requests</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{consultationStats.pending}</div>
                  <div className="text-sm text-yellow-600">Pending Review</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{consultationStats.confirmed}</div>
                  <div className="text-sm text-green-600">Confirmed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${(consultationStats.totalValue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-purple-600">Pipeline Value</div>
                </div>
              </div>

              {/* Consultations Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <SafeIcon icon={FiRefreshCw} className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span>Loading consultations...</span>
                  </div>
                ) : filteredConsultations.length === 0 ? (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiCalendar} className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No consultations found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredConsultations.map((consultation) => (
                          <tr key={consultation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {consultation.first_name?.[0]}{consultation.last_name?.[0]}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {consultation.first_name} {consultation.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">{consultation.title}</div>
                                  <div className="text-sm text-gray-500">{consultation.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{consultation.company}</div>
                              <div className="text-sm text-gray-500">{consultation.industry}</div>
                              <div className="text-sm text-gray-500">{consultation.company_size}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {format(new Date(consultation.preferred_date), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-sm text-gray-500">{consultation.preferred_time}</div>
                              <div className="text-sm text-gray-500">{consultation.timezone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${consultation.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : consultation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : consultation.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {consultation.status}
                              </span>
                              <div className={`text-xs mt-1 ${consultation.urgency === 'high'
                                ? 'text-red-600'
                                : consultation.urgency === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                                }`}>
                                {consultation.urgency} priority
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${(consultation.estimated_value || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                Score: {consultation.priority_score || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {consultation.status === 'pending' && (
                                  <button
                                    onClick={() => handleStatusUpdate(consultation.id, 'confirmed')}
                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                    title="Confirm consultation"
                                  >
                                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View details"
                                >
                                  <SafeIcon icon={FiEye} className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="Send email"
                                >
                                  <SafeIcon icon={FiMail} className="w-4 h-4" />
                                </button>
                                {consultation.phone && (
                                  <button
                                    className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                    title="Call"
                                  >
                                    <SafeIcon icon={FiPhone} className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lead Management Tab */}
          {activeTab === 'leads' && (
            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Executive Lead Management</h2>
                  <p className="text-gray-600 mt-1">Manage and track your sales pipeline</p>
                </div>
                <div className="flex flex-wrap items-center space-x-3 gap-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiSearch} className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>Add Lead</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center text-gray-500 py-8">
                  <SafeIcon icon={FiUsers} className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Lead management features coming soon</p>
                  <p className="text-sm">Integration with consultation bookings in progress</p>
                </div>
              </div>
            </div>
          )}

          {/* Performance Analytics Tab */}
          {activeTab === 'performance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Conversion Analytics & Business Intelligence</h2>
                  <p className="text-gray-600 mt-1">Track your business performance and growth metrics</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Export Analytics</span>
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <ReactECharts option={conversionData} style={{ height: '400px' }} />
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <ReactECharts option={performanceData} style={{ height: '400px' }} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authority Content Performance</h3>
                <div className="space-y-4">
                  {contentPerformance.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{content.type}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${content.trend === 'up'
                            ? 'bg-green-100 text-green-800'
                            : content.trend === 'down'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {content.trend === 'up' ? '↗' : content.trend === 'down' ? '↘' : '→'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {content.events > 0 ? `${content.events} events` : 'Ongoing'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{content.leads} leads</div>
                        <div className="text-sm text-gray-600">{content.conversions} conversions</div>
                        <div className="text-sm font-semibold text-green-600">{content.roi} ROI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Authority Content Tab - NEW IMPLEMENTATION */}
          {activeTab === 'content' && (
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
                    onClick={() => setShowNewContentModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>Create Content</span>
                  </button>
                </div>
              </div>

              {/* Content Performance Chart */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl mb-8">
                <ReactECharts option={contentPerformanceChart} style={{ height: '300px' }} />
              </div>

              {/* Content Grid */}
              <div className="grid gap-6">
                {filteredContent.map((content) => (
                  <div key={content.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${content.type === 'article'
                            ? 'bg-blue-100'
                            : content.type === 'speaking'
                              ? 'bg-purple-100'
                              : content.type === 'social'
                                ? 'bg-green-100'
                                : 'bg-yellow-100'
                            }`}>
                            <SafeIcon
                              icon={
                                content.type === 'article' ? FiFileText :
                                  content.type === 'speaking' ? FiMic :
                                    content.type === 'social' ? FiShare2 :
                                      FiVideo
                              }
                              className={`w-5 h-5 ${content.type === 'article'
                                ? 'text-blue-600'
                                : content.type === 'speaking'
                                  ? 'text-purple-600'
                                  : content.type === 'social'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
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
                                  {content.publishedDate
                                    ? format(new Date(content.publishedDate), 'MMM dd, yyyy')
                                    : content.scheduledDate
                                      ? `Scheduled: ${format(new Date(content.scheduledDate), 'MMM dd, yyyy')}`
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
                              {content.views || content.expectedAttendees || content.expectedListeners || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              {content.views ? 'Views' : content.expectedAttendees ? 'Expected Attendees' : 'Expected Listeners'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900">{content.engagement || 0}</div>
                            <div className="text-xs text-gray-500">Engagement</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-blue-600">{content.leads}</div>
                            <div className="text-xs text-gray-500">Leads Generated</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-green-600">{content.conversions}</div>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${content.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : content.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {content.status}
                        </span>

                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <SafeIcon icon={FiEdit} className="w-4 h-4" />
                          </button>
                          {content.url && (
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <SafeIcon icon={FiShare2} className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Content Modal */}
              {showNewContentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Create New Content</h3>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                          <input
                            type="date"
                            value={newContent.scheduledDate}
                            onChange={(e) => setNewContent(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <SafeIcon icon={FiSave} className="w-4 h-4" />
                          <span>Create Content</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab - NEW IMPLEMENTATION */}
          {activeTab === 'activity' && (
            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
                  <p className="text-gray-600 mt-1">Monitor all business activities and system events</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiSearch} className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={loadConsultations}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">24</div>
                      <div className="text-sm text-blue-600">Today's Activities</div>
                    </div>
                    <SafeIcon icon={FiActivity} className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{consultationStats.pending}</div>
                      <div className="text-sm text-green-600">Pending Actions</div>
                    </div>
                    <SafeIcon icon={FiClock} className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">156</div>
                      <div className="text-sm text-purple-600">This Week</div>
                    </div>
                    <SafeIcon icon={FiBarChart3} className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">3</div>
                      <div className="text-sm text-yellow-600">Urgent Items</div>
                    </div>
                    <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {filteredActivity.map((activity, activityIdx) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== filteredActivity.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full bg-${activity.color}-100 flex items-center justify-center ring-8 ring-white`}>
                                  <SafeIcon icon={activity.icon} className={`h-4 w-4 text-${activity.color}-600`} />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                  <p className="text-sm text-gray-500">{activity.description}</p>
                                  
                                  {/* Activity-specific details */}
                                  {activity.metrics && (
                                    <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                                      <span>{activity.metrics.views} views</span>
                                      <span>{activity.metrics.engagement} engagement</span>
                                    </div>
                                  )}
                                  
                                  {activity.value && (
                                    <div className="mt-2 text-sm font-semibold text-green-600">
                                      ${activity.value.toLocaleString()} value
                                    </div>
                                  )}
                                  
                                  {activity.event && (
                                    <div className="mt-2 text-sm text-purple-600">
                                      Event: {activity.event}
                                    </div>
                                  )}
                                  
                                  {activity.actionable && (
                                    <div className="mt-3 flex space-x-2">
                                      {activity.consultationId && (
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                          View Consultation
                                        </button>
                                      )}
                                      {activity.followUp && (
                                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                          Schedule Follow-up
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  <time dateTime={activity.timestamp}>
                                    {format(new Date(activity.timestamp), 'MMM dd, h:mm a')}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab - NEW IMPLEMENTATION */}
          {activeTab === 'settings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your account and business preferences</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

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
                          onChange={(e) => handleSettingsUpdate('business', 'consultationRate', parseInt(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Duration (minutes)</label>
                      <input
                        type="number"
                        value={settings.business.consultationDuration}
                        onChange={(e) => handleSettingsUpdate('business', 'consultationDuration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours Start</label>
                      <input
                        type="time"
                        value={settings.business.workingHours.start}
                        onChange={(e) => handleSettingsUpdate('business', 'workingHours', { ...settings.business.workingHours, start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours End</label>
                      <input
                        type="time"
                        value={settings.business.workingHours.end}
                        onChange={(e) => handleSettingsUpdate('business', 'workingHours', { ...settings.business.workingHours, end: e.target.value })}
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
                            className={`p-2 text-sm rounded-lg border ${settings.business.workingDays.includes(day)
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.integrations.calendly
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.integrations.zoom
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.integrations.slack
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${settings.integrations.hubspot
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;