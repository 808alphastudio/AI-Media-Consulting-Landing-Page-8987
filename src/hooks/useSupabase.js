import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      // Simple ping query to test connection
      const { data, error } = await supabase
        .from('consultations_booking_sys')
        .select('count')
        .limit(1);

      if (error) throw error;
      
      console.log("Supabase connection successful");
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Supabase connection error:', err);
      setIsConnected(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const insertConsultation = async (consultationData) => {
    try {
      const { data, error } = await supabase
        .from('consultations_booking_sys')
        .insert([consultationData])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Insert consultation error:', err);
      return { data: null, error: err.message };
    }
  };

  const getConsultations = async (filters = {}) => {
    try {
      let query = supabase
        .from('consultations_booking_sys')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.urgency) {
        query = query.eq('urgency', filters.urgency);
      }
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Get consultations error:', err);
      return { data: null, error: err.message };
    }
  };

  const updateConsultationStatus = async (id, status, notes = null) => {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from('consultations_booking_sys')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Update consultation error:', err);
      return { data: null, error: err.message };
    }
  };

  return {
    isConnected,
    isLoading,
    error,
    checkConnection,
    insertConsultation,
    getConsultations,
    updateConsultationStatus
  };
};