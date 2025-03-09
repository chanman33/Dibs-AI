'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Client } from '@/components/crm/columns'

// Get all clients
export async function getClients() {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .order('created_time', { ascending: false })
  
  if (error) {
    console.error('Error fetching clients:', error)
    throw new Error('Failed to fetch clients')
  }
  
  return data
}

// Get a single client by ID
export async function getClientById(id: number) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error(`Error fetching client with ID ${id}:`, error)
    throw new Error('Failed to fetch client')
  }
  
  return data
}

// Create a new client
export async function createClient(client: Omit<Client, 'id'>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('client')
    .insert([client])
    .select()
  
  if (error) {
    console.error('Error creating client:', error)
    throw new Error('Failed to create client')
  }
  
  revalidatePath('/dashboard/crm')
  return data[0]
}

// Update an existing client
export async function updateClient(id: number, client: Partial<Client>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('client')
    .update(client)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error(`Error updating client with ID ${id}:`, error)
    throw new Error('Failed to update client')
  }
  
  revalidatePath('/dashboard/crm')
  return data[0]
}

// Delete a client
export async function deleteClient(id: number) {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('client')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error(`Error deleting client with ID ${id}:`, error)
    throw new Error('Failed to delete client')
  }
  
  revalidatePath('/dashboard/crm')
  return true
}

// Seed the database with mock clients
export async function seedClients(count: number = 50, skipRevalidation = false) {
  const supabase = createSupabaseClient()
  
  // First check if we already have clients
  const { count: existingCount, error: countError } = await supabase
    .from('client')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error checking existing clients:', countError)
    throw new Error('Failed to check existing clients')
  }
  
  // If we already have clients, don't seed
  if (existingCount && existingCount > 0) {
    return { message: `Database already has ${existingCount} clients. Skipping seed.` }
  }
  
  // Import mock data generator
  const { generateMockClients } = await import('@/lib/mock-data')
  
  // Generate mock clients without IDs (database will assign them)
  const mockClients = generateMockClients(count).map(client => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...clientWithoutId } = client
    return clientWithoutId
  })
  
  // Insert mock clients
  const { data, error } = await supabase
    .from('client')
    .insert(mockClients)
    .select()
  
  if (error) {
    console.error('Error seeding clients:', error)
    throw new Error('Failed to seed clients')
  }
  
  if (!skipRevalidation) {
    revalidatePath('/dashboard/crm')
  }
  
  return { message: `Successfully seeded ${mockClients.length} clients` }
} 