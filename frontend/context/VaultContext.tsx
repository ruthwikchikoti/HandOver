import React, { createContext, useContext, useState, ReactNode } from 'react';
import { vaultAPI } from '../utils/api';

export interface KnowledgeEntry {
  _id: string;
  ownerId: string;
  category: 'assets' | 'liabilities' | 'insurance' | 'contacts' | 'emergency' | 'notes';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  assets: number;
  liabilities: number;
  insurance: number;
  contacts: number;
  emergency: number;
  notes: number;
}

interface VaultContextType {
  entries: KnowledgeEntry[];
  stats: CategoryStats;
  loading: boolean;
  fetchEntries: () => Promise<void>;
  fetchEntriesByCategory: (category: string) => Promise<KnowledgeEntry[]>;
  fetchStats: () => Promise<void>;
  createEntry: (data: { category: string; title: string; content: string }) => Promise<KnowledgeEntry>;
  updateEntry: (id: string, data: { title?: string; content?: string; category?: string }) => Promise<KnowledgeEntry>;
  deleteEntry: (id: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    assets: 0,
    liabilities: 0,
    insurance: 0,
    contacts: 0,
    emergency: 0,
    notes: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await vaultAPI.getAll();
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchEntriesByCategory = async (category: string): Promise<KnowledgeEntry[]> => {
    const response = await vaultAPI.getByCategory(category);
    return response.data;
  };

  const fetchStats = async () => {
    try {
      const response = await vaultAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  const createEntry = async (data: { category: string; title: string; content: string }): Promise<KnowledgeEntry> => {
    const response = await vaultAPI.create(data);
    const newEntry = response.data;
    setEntries(prev => [newEntry, ...prev]);
    setStats(prev => ({
      ...prev,
      [data.category]: prev[data.category as keyof CategoryStats] + 1,
    }));
    return newEntry;
  };

  const updateEntry = async (id: string, data: { title?: string; content?: string; category?: string }): Promise<KnowledgeEntry> => {
    const response = await vaultAPI.update(id, data);
    const updatedEntry = response.data;
    setEntries(prev => prev.map(e => e._id === id ? updatedEntry : e));
    return updatedEntry;
  };

  const deleteEntry = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    await vaultAPI.delete(id);
    setEntries(prev => prev.filter(e => e._id !== id));
    if (entry) {
      setStats(prev => ({
        ...prev,
        [entry.category]: prev[entry.category as keyof CategoryStats] - 1,
      }));
    }
  };

  return (
    <VaultContext.Provider
      value={{
        entries,
        stats,
        loading,
        fetchEntries,
        fetchEntriesByCategory,
        fetchStats,
        createEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
