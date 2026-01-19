import React, { createContext, useContext, useState, ReactNode } from 'react';
import { accessAPI } from '../utils/api';
import { KnowledgeEntry } from './VaultContext';
import { Permissions } from './DependentContext';

export interface AccessRequest {
  _id: string;
  ownerId: string | { _id: string; name: string; email: string; isInactive?: boolean; lastActivityAt?: string };
  dependentId: string | { _id: string; name: string; email: string };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  processedBy?: { _id: string; name: string };
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  _id: string;
  ownerId: string;
  action: string;
  performedBy: { _id: string; name: string; email: string; role: string };
  category?: string;
  details: string;
  createdAt: string;
}

interface AccessContextType {
  myRequests: AccessRequest[];
  pendingRequests: AccessRequest[];
  allRequests: AccessRequest[];
  auditLogs: AuditLogEntry[];
  loading: boolean;
  requestAccess: (ownerId: string, reason: string) => Promise<AccessRequest>;
  fetchMyRequests: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchAllRequests: () => Promise<void>;
  approveRequest: (id: string, adminNote?: string) => Promise<void>;
  rejectRequest: (id: string, adminNote?: string) => Promise<void>;
  viewOwnerVault: (ownerId: string) => Promise<{ entries: KnowledgeEntry[]; permissions: Permissions }>;
  fetchAuditLogs: () => Promise<void>;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myRequests, setMyRequests] = useState<AccessRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AccessRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const requestAccess = async (ownerId: string, reason: string): Promise<AccessRequest> => {
    const response = await accessAPI.requestAccess({ ownerId, reason });
    const newRequest = response.data;
    setMyRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await accessAPI.getMyRequests();
      setMyRequests(response.data);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await accessAPI.getPending();
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const response = await accessAPI.getAll();
      setAllRequests(response.data);
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string, adminNote?: string) => {
    await accessAPI.approve(id, adminNote);
    setPendingRequests(prev => prev.filter(r => r._id !== id));
    setAllRequests(prev => prev.map(r =>
      r._id === id ? { ...r, status: 'approved' as const, adminNote: adminNote || '' } : r
    ));
  };

  const rejectRequest = async (id: string, adminNote?: string) => {
    await accessAPI.reject(id, adminNote);
    setPendingRequests(prev => prev.filter(r => r._id !== id));
    setAllRequests(prev => prev.map(r =>
      r._id === id ? { ...r, status: 'rejected' as const, adminNote: adminNote || '' } : r
    ));
  };

  const viewOwnerVault = async (ownerId: string): Promise<{ entries: KnowledgeEntry[]; permissions: Permissions }> => {
    const response = await accessAPI.viewVault(ownerId);
    return response.data;
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await accessAPI.getLogs();
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessContext.Provider
      value={{
        myRequests,
        pendingRequests,
        allRequests,
        auditLogs,
        loading,
        requestAccess,
        fetchMyRequests,
        fetchPendingRequests,
        fetchAllRequests,
        approveRequest,
        rejectRequest,
        viewOwnerVault,
        fetchAuditLogs,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};
