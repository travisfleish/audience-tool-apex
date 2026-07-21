import { useState, useEffect } from 'react';
import { AUDIENCE_SELECT, toAudiences } from './audienceVariants';
import { supabase } from './supabase';
import { Audience, Report } from './types';

export function useAudiences() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudiences();
  }, []);

  const fetchAudiences = async () => {
    try {
      let allData: Audience[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('audiences')
          .select(AUDIENCE_SELECT)
          .order('is_featured', { ascending: false })
          .order('name', { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error fetching audiences:', error);
          break;
        }

        if (data) {
          allData = [...allData, ...toAudiences(data)];
          hasMore = data.length === pageSize;
          from += pageSize;
        } else {
          hasMore = false;
        }
      }

      setAudiences(allData);
    } catch (error) {
      console.error('Error fetching audiences:', error);
    } finally {
      setLoading(false);
    }
  };

  return { audiences, loading };
}

export function useFeaturedReport() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    supabase
      .from('reports')
      .select('*')
      .eq('is_featured', true)
      .order('published_date', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setReport(data);
      });
  }, []);

  return report;
}
