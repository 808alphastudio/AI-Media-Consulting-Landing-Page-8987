import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import BookingModal from '../components/BookingModal';
import supabase from '../lib/supabase';

const {
  FiArrowRight, FiCheck, FiStar, FiTrendingUp, FiUsers, FiGlobe, FiCalendar,
  FiMail, FiPhone, FiPlay, FiAward, FiBarChart3, FiTarget, FiZap, FiClock,
  FiShield, FiLock, FiAlertCircle
} = FiIcons;

const LandingPage = ({ isSupabaseReady, connectionError }) => {
  const [isVisible, setIsVisible] = useState({});
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Check Supabase connection
  useEffect(() => {
    if (isSupabaseReady) {
      const checkConnection = async () => {
        try {
          const { data, error } = await supabase
            .from('consultations_booking_sys')
            .select('count')
            .limit(1);
            
          if (error) {
            console.error("Error connecting to Supabase:", error);
          } else {
            console.log("Successfully connected to Supabase");
          }
        } catch (err) {
          console.error("Failed to connect to Supabase:", err);
        }
      };
      
      checkConnection();
    }
  }, [isSupabaseReady]);

  const handleBookingSuccess = (consultationData) => {
    setBookingSuccess(consultationData);
    setBookingModalOpen(false);
    
    // Scroll to success message or show notification
    setTimeout(() => {
      alert(`Thank you ${consultationData.name}! Your consultation has been booked for ${consultationData.preferredDate} at ${consultationData.preferredTime}. Check your email for confirmation details.`);
    }, 500);
  };

  const openBookingModal = () => {
    setBookingModalOpen(true);
  };

  const stats = [
    {
      number: "35+",
      label: "Years Media Experience",
      icon: FiTrendingUp
    },
    {
      number: "500+",
      label: "Media Executives Trained",
      icon: FiUsers
    },
    {
      number: "50+",
      label: "AI Implementations",
      icon: FiTarget
    },
    {
      number: "95%",
      label: "Client Satisfaction",
      icon: FiStar
    }
  ];

  const testimonials = [
    {
      quote: "Guy's AI enablement strategy increased our content production by 300% while maintaining quality. The ROI was immediate.",
      author: "Sarah Chen",
      title: "News Director, Pacific Media Group",
      company: "Revenue: +$2.4M annually"
    },
    {
      quote: "The AI-Enabled Media 3.0 framework transformed our newsroom operations. We're now leading our market in digital engagement.",
      author: "Michael Rodriguez",
      title: "CEO, Northwest Broadcasting",
      company: "Efficiency: +400% content output"
    },
    {
      quote: "Tasaka Digital's virtual coaching enabled our international expansion with AI-powered content localization across 12 markets.",
      author: "Emma Thompson",
      title: "VP Digital Strategy, Global News Network",
      company: "Expansion: 12 new markets"
    }
  ];

  const faqItems = [
    {
      question: "How quickly can we see results from AI implementation?",
      answer: "Most clients see immediate efficiency gains within 30 days. Full AI transformation typically delivers measurable ROI within 90 days, with content production increases of 200-400%."
    },
    {
      question: "What makes your approach different from other AI consultants?",
      answer: "I combine 35+ years of media industry experience with hands-on AI implementation expertise. Unlike theoretical consultants, I provide practical, industry-specific solutions with proven results."
    },
    {
      question: "Can you work with our remote teams globally?",
      answer: "Absolutely. My virtual coaching methodology supports teams worldwide with time zone optimization, cultural adaptation, and multi-platform training delivery."
    },
    {
      question: "What's included in the free AI strategy consultation?",
      answer: "A comprehensive assessment of your current operations, AI opportunity identification, competitive analysis, and a customized roadmap for AI implementation with projected ROI."
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-red-700">
            <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
            <span>Database connection error: {connectionError}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <motion.header
        style={{ opacity }}
        className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiZap} className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tasaka Digital</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 text-sm"
              >
                <SafeIcon icon={FiLock} className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                onClick={openBookingModal}
                disabled={!isSupabaseReady}
              >
                Book Free Consultation
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  🏆 LMA Innovator of the Year
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Editor & Publisher AI Columnist
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Stop Letting AI Disruption <span className="text-blue-600">Threaten</span> Your Media Business
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get practical AI enablement strategies from the industry's proven innovation leader. Transform your media company with 35+ years of experience and cutting-edge AI implementation expertise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  onClick={openBookingModal}
                  disabled={!isSupabaseReady}
                >
                  <span>Book Your Free AI Strategy Consultation</span>
                  <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
                  onClick={() => document.getElementById('methodology').scrollIntoView({ behavior: 'smooth' })}
                >
                  <SafeIcon icon={FiPlay} className="w-5 h-5" />
                  <span>See AI-Enabled Media 3.0</span>
                </motion.button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
                  <span>Free consultation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiGlobe} className="w-4 h-4 text-green-500" />
                  <span>Global virtual delivery</span>
                </div>
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiShield} className="w-4 h-4 text-green-500" />
                  <span>Confidential & secure</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  alt="Guy Tasaka - AI Media Consultant"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Media Executives Trained</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same */}
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={stat.icon} className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Authority Section */}
      <section id="problem" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                AI is Reshaping Media. Are You Ready?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Competitive Pressure Intensifying</h3>
                    <p className="text-gray-600">Media companies using AI are producing 3x more content while reducing costs by 40%. Without AI enablement, you're falling behind.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <SafeIcon icon={FiTarget} className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Implementation Confusion</h3>
                    <p className="text-gray-600">Generic AI consultants don't understand media workflows. You need industry-specific expertise that delivers practical results.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <SafeIcon icon={FiClock} className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Time is Running Out</h3>
                    <p className="text-gray-600">Every month without AI adoption means lost revenue, reduced efficiency, and competitive disadvantage in your market.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">The Comprehensive Solution</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">35+ years media industry experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Proven AI implementation expertise</span>
                </div>
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Industry recognition & awards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Practical, results-focused approach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Global virtual delivery capability</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold mt-6 hover:bg-blue-700 transition-colors"
                onClick={openBookingModal}
                disabled={!isSupabaseReady}
              >
                Get Your AI Strategy Assessment
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of the content remains the same */}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiZap} className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Tasaka Digital</span>
              </div>
              <p className="text-gray-400">
                Transforming media companies with practical AI enablement strategies and proven industry expertise.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Credentials</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiAward} className="w-4 h-4" />
                  <span>LMA Innovator of the Year</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiAward} className="w-4 h-4" />
                  <span>Editor & Publisher AI Columnist</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} className="w-4 h-4" />
                  <span>500+ Media Executives Trained</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div>guy@tasakadigital.com</div>
                <div>Pacific Northwest & Global Virtual</div>
                <div>AI Consulting • Media Strategy • Implementation</div>
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 text-gray-400 hover:text-white mt-4 text-sm"
                >
                  <SafeIcon icon={FiLock} className="w-3.5 h-3.5" />
                  <span>Admin Access</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {currentYear} Tasaka Digital. All rights reserved. | Confidential AI Strategy Consulting</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default LandingPage;