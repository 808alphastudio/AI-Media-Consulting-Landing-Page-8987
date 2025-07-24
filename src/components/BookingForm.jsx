import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiCalendar, FiUser, FiMail, FiPhone, FiBuilding, FiGlobe, FiClock, FiCheck, FiAlertCircle, FiLoader } = FiIcons;

const BookingForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    industry: '',
    companySize: '',
    timezone: '',
    preferredDate: '',
    preferredTime: '',
    secondaryDate: '',
    secondaryTime: '',
    urgency: 'medium',
    currentChallenges: '',
    aiExperience: '',
    specificInterests: [],
    hearAboutUs: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const industries = [
    'Broadcasting', 'Digital Media', 'Publishing', 'Newspapers', 
    'Radio', 'Television', 'Streaming', 'Podcasting', 
    'Content Creation', 'Marketing Agency', 'Other'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-100 employees',
    '101-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const timezones = [
    'Pacific Time (PT)', 'Mountain Time (MT)', 'Central Time (CT)', 
    'Eastern Time (ET)', 'GMT/UTC', 'Central European Time (CET)',
    'Asia Pacific (APAC)', 'Other'
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const aiInterests = [
    'Content Automation', 'Audience Analytics', 'Personalization',
    'Content Creation', 'Workflow Optimization', 'Cost Reduction',
    'Revenue Growth', 'Competitive Advantage', 'Team Training'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleCheckboxChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      specificInterests: prev.specificInterests.includes(interest)
        ? prev.specificInterests.filter(item => item !== interest)
        : [...prev.specificInterests, interest]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.companySize) newErrors.companySize = 'Company size is required';
    if (!formData.timezone) newErrors.timezone = 'Timezone is required';
    if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required';
    if (!formData.preferredTime) newErrors.preferredTime = 'Preferred time is required';
    if (!formData.currentChallenges.trim()) newErrors.currentChallenges = 'Please describe your current challenges';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Date validation (must be in the future)
    if (formData.preferredDate) {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.preferredDate = 'Please select a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Generate consultation ID
      const consultationId = `CONS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Prepare data for Supabase
      const consultationData = {
        consultation_id: consultationId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company,
        title: formData.title,
        industry: formData.industry,
        company_size: formData.companySize,
        timezone: formData.timezone,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        secondary_date: formData.secondaryDate || null,
        secondary_time: formData.secondaryTime || null,
        urgency: formData.urgency,
        current_challenges: formData.currentChallenges,
        ai_experience: formData.aiExperience || null,
        specific_interests: formData.specificInterests,
        hear_about_us: formData.hearAboutUs || null,
        additional_notes: formData.additionalNotes || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        estimated_value: calculateEstimatedValue(formData),
        priority_score: calculatePriorityScore(formData)
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('consultations_booking_sys')
        .insert([consultationData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to book consultation. Please try again.');
      }

      setSubmitStatus('success');
      
      // Call success callback with consultation data
      if (onSuccess) {
        onSuccess({
          consultationId,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          company: formData.company,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime
        });
      }

    } catch (error) {
      console.error('Booking error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedValue = (data) => {
    let baseValue = 50000; // Base consultation value
    
    // Increase based on company size
    const sizeMultipliers = {
      '1-10 employees': 0.5,
      '11-50 employees': 0.8,
      '51-100 employees': 1.0,
      '101-500 employees': 1.5,
      '501-1000 employees': 2.0,
      '1000+ employees': 3.0
    };
    
    const sizeMultiplier = sizeMultipliers[data.companySize] || 1.0;
    
    // Increase based on urgency
    const urgencyMultipliers = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3
    };
    
    const urgencyMultiplier = urgencyMultipliers[data.urgency] || 1.0;
    
    // Increase based on number of interests
    const interestMultiplier = 1 + (data.specificInterests.length * 0.1);
    
    return Math.round(baseValue * sizeMultiplier * urgencyMultiplier * interestMultiplier);
  };

  const calculatePriorityScore = (data) => {
    let score = 50; // Base score
    
    // Increase based on urgency
    const urgencyScores = { 'low': 0, 'medium': 20, 'high': 40 };
    score += urgencyScores[data.urgency] || 0;
    
    // Increase based on company size
    const sizeScores = {
      '1-10 employees': 5,
      '11-50 employees': 10,
      '51-100 employees': 15,
      '101-500 employees': 25,
      '501-1000 employees': 35,
      '1000+ employees': 45
    };
    score += sizeScores[data.companySize] || 0;
    
    // Increase based on specific interests count
    score += data.specificInterests.length * 2;
    
    return Math.min(100, score); // Cap at 100
  };

  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Consultation Booked!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for booking your AI strategy consultation. You'll receive a confirmation email within 5 minutes with next steps and calendar details.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book Your Free AI Strategy Consultation</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 mr-2" />
          <span>Failed to book consultation. Please try again or contact us directly.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John"
              />
            </div>
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Smith"
              />
            </div>
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="john@company.com"
              />
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Company Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            <div className="relative">
              <SafeIcon icon={FiBuilding} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.company ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Acme Media Corp"
              />
            </div>
            {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="CEO, CTO, News Director, etc."
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry *
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.industry ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && <p className="text-red-600 text-sm mt-1">{errors.industry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size *
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.companySize ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Company Size</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            {errors.companySize && <p className="text-red-600 text-sm mt-1">{errors.companySize}</p>}
          </div>
        </div>

        {/* Scheduling */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone *
          </label>
          <div className="relative">
            <SafeIcon icon={FiGlobe} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.timezone ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Timezone</option>
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          {errors.timezone && <p className="text-red-600 text-sm mt-1">{errors.timezone}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date *
            </label>
            <div className="relative">
              <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.preferredDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.preferredDate && <p className="text-red-600 text-sm mt-1">{errors.preferredDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time *
            </label>
            <div className="relative">
              <SafeIcon icon={FiClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.preferredTime ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            {errors.preferredTime && <p className="text-red-600 text-sm mt-1">{errors.preferredTime}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternative Date
            </label>
            <div className="relative">
              <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="secondaryDate"
                value={formData.secondaryDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternative Time
            </label>
            <div className="relative">
              <SafeIcon icon={FiClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="secondaryTime"
                value={formData.secondaryTime}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Alternative Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How urgent is your AI implementation need?
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'low', label: 'Exploring Options', color: 'green' },
              { value: 'medium', label: 'Planning Implementation', color: 'yellow' },
              { value: 'high', label: 'Immediate Need', color: 'red' }
            ].map(option => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value={option.value}
                  checked={formData.urgency === option.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-full p-3 border-2 rounded-lg text-center transition-colors ${
                  formData.urgency === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className="font-medium">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Current Challenges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What are your current AI/automation challenges? *
          </label>
          <textarea
            name="currentChallenges"
            value={formData.currentChallenges}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.currentChallenges ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe your current challenges with content creation, workflow efficiency, competition, cost management, etc."
          />
          {errors.currentChallenges && <p className="text-red-600 text-sm mt-1">{errors.currentChallenges}</p>}
        </div>

        {/* AI Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current AI/Automation Experience
          </label>
          <textarea
            name="aiExperience"
            value={formData.aiExperience}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What AI tools or automation processes are you currently using? (Optional)"
          />
        </div>

        {/* Specific Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Specific Areas of Interest (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiInterests.map(interest => (
              <label key={interest} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.specificInterests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* How did you hear about us */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How did you hear about us?
          </label>
          <select
            name="hearAboutUs"
            value={formData.hearAboutUs}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option</option>
            <option value="google">Google Search</option>
            <option value="linkedin">LinkedIn</option>
            <option value="speaking">Speaking Engagement</option>
            <option value="column">Editor & Publisher Column</option>
            <option value="referral">Professional Referral</option>
            <option value="conference">Industry Conference</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information you'd like to share about your goals, timeline, or specific questions?"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                <span>Booking...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                <span>Book Free Consultation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BookingForm;