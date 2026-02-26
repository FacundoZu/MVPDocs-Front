import { useState } from 'react';
import axios from 'axios';
import type { IQuote } from '../types'; 

export const useQuotesOfTag = (tagId: string) => {
  const [quotes, setQuotes] = useState<IQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    if (!tagId) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/quotes/tag/${tagId}`);
      setQuotes(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las citas del tag');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { quotes, loading, error, fetchQuotes };
};