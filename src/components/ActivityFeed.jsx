import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { format, parseISO } from 'date-fns';
import supabase from '../lib/supabase';

const {
  FiActivity, FiClock, FiBarChart3, FiAlertCircle, FiSearch, FiRefreshCw,
  FiCalendar, FiEdit3, FiDollarSign, FiAward, FiCheckCircle, FiFilter,
  FiPlus, FiEye, FiTrash2, FiSave, FiX, FiMessageSquare, FiUser, FiTag
} = FiIcons;

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityStats, setActivityStats] = useState({
    today: 0,
    pendingActions: 0,
    thisWeek: 0,
    urgentItems: 0
  });

  const [newActivity, setNewActivity] = useState({
    type: 'note',
    title: '',
    description: '',
    icon: 'FiMessageSquare',
    color: 'blue',
    actionable: false,
    follow_up: false
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_feed_admin_sys')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setActivities(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Error loading activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const stats = {
      today: data.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= today;
      }).length,
      
      pendingActions: data.filter(item => item.actionable && !item.completed).length,
      
      thisWeek: data.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= weekStart;
      }).length,
      
      urgentItems: data.filter(item => 
        item.actionable && 
        !item.completed && 
        (item.type.includes('urgent') || item.type.includes('high'))
      ).length
    };
    
    setActivityStats(stats);
  };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const activityData = {
        ...newActivity,
        timestamp: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('activity_feed_admin_sys')
        .insert([activityData])
        .select();
        
      if (error) throw error;
      
      setShowAddModal(false);
      resetForm();
      loadActivities();
      
    } catch (err) {
      console.error("Error saving activity:", err);
      alert("Failed to save activity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      const { error } = await supabase
        .from('activity_feed_admin_sys')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      loadActivities();
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Failed to delete activity");
    }
  };

  const resetForm = () => {
    setNewActivity({
      type: 'note',
      title: '',
      description: '',
      icon: 'FiMessageSquare',
      color: 'blue',
      actionable: false,
      follow_up: false
    });
  };

  const markActionComplete = async (id) => {
    try {
      const { data, error } = await supabase
        .from('activity_feed_admin_sys')
        .update({ completed: true })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      loadActivities();
    } catch (err) {
      console.error("Error updating activity:", err);
      alert("Failed to update activity");
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const searchMatch = 
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === 'all' || activity.type === filterType;
    
    return searchMatch && typeMatch;
  });

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'consultation_booked', label: 'Consultation Bookings' },
    { value: 'content_published', label: 'Content Published' },
    { value: 'lead_converted', label: 'Lead Conversions' },
    { value: 'speaking_confirmed', label: 'Speaking Engagements' },
    { value: 'consultation_completed', label: 'Completed Consultations' },
    { value: 'note', label: 'Notes' }
  ];

  const iconOptions = [
    { value: 'FiMessageSquare', label: 'Message', icon: FiMessageSquare },
    { value: 'FiCalendar', label: 'Calendar', icon: FiCalendar },
    { value: 'FiEdit3', label: 'Edit', icon: FiEdit3 },
    { value: 'FiDollarSign', label: 'Dollar', icon: FiDollarSign },
    { value: 'FiAward', label: 'Award', icon: FiAward },
    { value: 'FiCheckCircle', label: 'Check', icon: FiCheckCircle },
    { value: 'FiUser', label: 'User', icon: FiUser },
    { value: 'FiTag', label: 'Tag', icon: FiTag },
    { value: 'FiActivity', label: 'Activity', icon: FiActivity }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' }
  ];

  // Helper function to render the correct icon component
  const renderIcon = (iconName) => {
    const iconMap = {
      'FiCalendar': FiCalendar,
      'FiEdit3': FiEdit3,
      'FiDollarSign': FiDollarSign,
      'FiAward': FiAward,
      'FiCheckCircle': FiCheckCircle,
      'FiUser': FiUser,
      'FiMessageSquare': FiMessageSquare,
      'FiTag': FiTag,
      'FiActivity': FiActivity,
      'FiTrash2': FiTrash2,
      'FiAlertCircle': FiAlertCircle
    };
    
    return iconMap[iconName] || FiActivity;
  };

  return (
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
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Note</span>
          </button>
          <button
            onClick={loadActivities}
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
              <div className="text-2xl font-bold text-blue-600">{activityStats.today}</div>
              <div className="text-sm text-blue-600">Today's Activities</div>
            </div>
            <SafeIcon icon={FiActivity} className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{activityStats.pendingActions}</div>
              <div className="text-sm text-green-600">Pending Actions</div>
            </div>
            <SafeIcon icon={FiClock} className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{activityStats.thisWeek}</div>
              <div className="text-sm text-purple-600">This Week</div>
            </div>
            <SafeIcon icon={FiBarChart3} className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{activityStats.urgentItems}</div>
              <div className="text-sm text-yellow-600">Urgent Items</div>
            </div>
            <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
        <div className="text-sm font-medium text-gray-500">Filter:</div>
        {activityTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
              filterType === type.value
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <SafeIcon icon={FiActivity} className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No activities found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Add Your First Activity
              </button>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {filteredActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== filteredActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full bg-${activity.color}-100 flex items-center justify-center ring-8 ring-white`}>
                            <SafeIcon icon={renderIcon(activity.icon)} className={`h-4 w-4 text-${activity.color}-600`} />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                            
                            {/* Activity-specific details */}
                            {activity.metrics && (
                              <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                                {activity.metrics.views && <span>{activity.metrics.views} views</span>}
                                {activity.metrics.engagement && <span>{activity.metrics.engagement} engagement</span>}
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
                            
                            {activity.actionable && !activity.completed && (
                              <div className="mt-3 flex space-x-2">
                                {activity.consultation_id && (
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Consultation
                                  </button>
                                )}
                                {activity.follow_up && (
                                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                    Schedule Follow-up
                                  </button>
                                )}
                                <button 
                                  onClick={() => markActionComplete(activity.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                >
                                  <SafeIcon icon={FiCheckCircle} className="w-3.5 h-3.5 mr-1" />
                                  Mark Complete
                                </button>
                              </div>
                            )}

                            {activity.completed && (
                              <div className="mt-2 text-xs text-green-600 flex items-center">
                                <SafeIcon icon={FiCheckCircle} className="w-3.5 h-3.5 mr-1" />
                                Completed
                              </div>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right">
                            <div className="text-sm text-gray-500">
                              {format(parseISO(activity.timestamp), 'MMM dd, h:mm a')}
                            </div>
                            <button 
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center justify-end"
                            >
                              <SafeIcon icon={FiTrash2} className="w-3 h-3 mr-0.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Add Activity Note</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Activity title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Activity description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={newActivity.icon}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    value={newActivity.color}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="actionable"
                  checked={newActivity.actionable}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, actionable: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="actionable" className="text-sm text-gray-700">
                  Requires action
                </label>
              </div>

              {newActivity.actionable && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={newActivity.follow_up}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, follow_up: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="followUp" className="text-sm text-gray-700">
                    Requires follow-up
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                      <span>Add Activity</span>
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

export default ActivityFeed;