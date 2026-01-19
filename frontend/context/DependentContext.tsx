import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dependentsAPI } from '../utils/api';

export interface Permissions {
  assets: boolean;
  liabilities: boolean;
  insurance: boolean;
  contacts: boolean;
  emergency: boolean;
  notes: boolean;
}

export interface DependentRelation {
  _id: string;
  ownerId: string | { _id: string; name: string; email: string; isInactive?: boolean; lastActivityAt?: string };
  dependentId: { _id: string; name: string; email: string };
  permissions: Permissions;
  accessGranted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DependentContextType {
  dependents: DependentRelation[];
  owners: DependentRelation[];
  loading: boolean;
  fetchDependents: () => Promise<void>;
  fetchOwners: () => Promise<void>;
  addDependent: (email: string, permissions?: Partial<Permissions>) => Promise<DependentRelation>;
  updateDependentPermissions: (id: string, permissions: Permissions) => Promise<DependentRelation>;
  removeDependent: (id: string) => Promise<void>;
}

const DependentContext = createContext<DependentContextType | undefined>(undefined);

export const DependentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dependents, setDependents] = useState<DependentRelation[]>([]);
  const [owners, setOwners] = useState<DependentRelation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDependents = async () => {
    setLoading(true);
    try {
      const response = await dependentsAPI.getAll();
      setDependents(response.data);
    } catch (error) {
      console.error('Error fetching dependents:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const response = await dependentsAPI.getOwners();
      setOwners(response.data);
    } catch (error) {
      console.error('Error fetching owners:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addDependent = async (email: string, permissions?: Partial<Permissions>): Promise<DependentRelation> => {
    const response = await dependentsAPI.add({ email, permissions });
    const newDependent = response.data;
    setDependents(prev => [newDependent, ...prev]);
    return newDependent;
  };

  const updateDependentPermissions = async (id: string, permissions: Permissions): Promise<DependentRelation> => {
    const response = await dependentsAPI.update(id, { permissions });
    const updatedDependent = response.data;
    setDependents(prev => prev.map(d => d._id === id ? updatedDependent : d));
    return updatedDependent;
  };

  const removeDependent = async (id: string) => {
    await dependentsAPI.remove(id);
    setDependents(prev => prev.filter(d => d._id !== id));
  };

  return (
    <DependentContext.Provider
      value={{
        dependents,
        owners,
        loading,
        fetchDependents,
        fetchOwners,
        addDependent,
        updateDependentPermissions,
        removeDependent,
      }}
    >
      {children}
    </DependentContext.Provider>
  );
};

export const useDependents = () => {
  const context = useContext(DependentContext);
  if (context === undefined) {
    throw new Error('useDependents must be used within a DependentProvider');
  }
  return context;
};
