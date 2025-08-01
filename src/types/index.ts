export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'agent' | 'admin'
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  property_type: 'apartment' | 'house' | 'villa' | 'commercial'
  status: 'available' | 'sold' | 'rented'
  images: string[]
  agent_id: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  phone: string
  bio?: string
  specialization?: string
  license_number?: string
  properties_count: number
  created_at: string
  updated_at: string
}
