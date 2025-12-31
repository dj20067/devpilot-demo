
export enum SessionStatus {
  ACTIVE = 'active',
  QUEUED = 'queued',
  ENDED = 'ended',
}

export enum UserRole {
  ENGINEER = 'engineer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tenantType: string; // Changed to string to support translated values directly or mapped keys
  accountType: string;
  tier: string;
  phone: string;
  company: string;
  // Extended info (Admin only)
  certificateLevel?: string;
  customerStatus?: string;
  partnershipType?: string;
  region?: string;
  serviceGroup?: string;
  signedYear?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'system_end_confirmation'; // Added system types
  fileUrl?: string;
  fileName?: string;
  isDeleted?: boolean;
  replyToId?: string;
  // For End Confirmation Card
  endConfirmationStatus?: 'pending' | 'solved' | 'unsolved';
}

export interface ServiceRecord {
  id: string;
  type: 'chat' | 'ticket' | 'call';
  date: string;
  summary: string;
  status: string;
  agent: string;
}

export interface TicketEvent {
    id: string;
    ticketId: string;
    sender: User | Customer | 'SYSTEM';
    content: string; // Supports markdown or rich text html
    type: 'internal_note' | 'public_reply' | 'system_log';
    attachments?: { name: string, type: 'image' | 'file' | 'video' | 'rpa_dsl', url?: string, content?: string }[];
    createdAt: Date;
}

export interface Ticket {
    id: string;
    subject: string;
    description: string; // Main issue description
    descriptionRpaDsl?: string; // Optional JSON string for RPA snippet in description
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    customer: Customer;
    assignee?: User;
    cc?: User[];
    collaborators?: User[];
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    timeline: TicketEvent[]; // New: Unified timeline for communication
}

export interface ConsultationForm {
  productModule: string;
  environment: string;
  severity: string;
  description: string;
  version: string;
}

export interface Session {
  id: string;
  status: SessionStatus;
  customer: Customer;
  startTime: Date;
  duration: string;
  source: string;
  handlerId: string;
  lastMessage: string;
  unreadCount: number;
  consultationForm: ConsultationForm;
}
