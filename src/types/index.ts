export interface User {
  id: string
  mobile_number: string
  full_name?: string
  avatar_url?: string
  role: 'agent' | 'admin' | 'client'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  license_number?: string
  specialization?: string
  bio?: string
  commission_rate: number
  properties_count: number
  total_sales: number
  created_at: string
  updated_at: string
  user?: User
}

export interface Client {
  id: string
  user_id: string
  preferred_location?: string
  budget_min?: number
  budget_max?: number
  preferred_property_type?: PropertyType
  notes?: string
  assigned_agent_id?: string
  created_at: string
  updated_at: string
  user?: User
  assigned_agent?: Agent
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'commercial' | 'land'
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending'
export type UserRole = 'agent' | 'admin' | 'client'

export interface Property {
  id: string
  title: string
  description?: string
  price: number
  location: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  property_type: PropertyType
  status: PropertyStatus
  images?: string[]
  features?: string[]
  agent_id?: string
  created_at: string
  updated_at: string
  agent?: Agent
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  alt_text?: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface Lead {
  id: string
  client_id?: string
  property_id?: string
  agent_id?: string
  status: string
  notes?: string
  follow_up_date?: string
  created_at: string
  updated_at: string
  client?: Client
  property?: Property
  agent?: Agent
}

export interface Appointment {
  id: string
  client_id?: string
  agent_id?: string
  property_id?: string
  appointment_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  client?: Client
  agent?: Agent
  property?: Property
}

export interface Transaction {
  id: string
  property_id?: string
  client_id?: string
  agent_id?: string
  transaction_type: 'sale' | 'rent'
  amount: number
  commission?: number
  status: string
  contract_date?: string
  completion_date?: string
  notes?: string
  created_at: string
  updated_at: string
  property?: Property
  client?: Client
  agent?: Agent
}

export interface AdminStats {
  total_users: number
  total_agents: number
  total_clients: number
  total_properties: number
  available_properties: number
  sold_properties: number
  total_transactions: number
  pending_transactions: number
  completed_transactions: number
}
