'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Property } from '@/lib/mock-data'

// Get all properties
export async function getProperties() {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .order('created_time', { ascending: false })
  
  if (error) {
    console.error('Error fetching properties:', error)
    throw new Error('Failed to fetch properties')
  }
  
  return data
}

// Get a single property by ID
export async function getPropertyById(id: number) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error(`Error fetching property with ID ${id}:`, error)
    throw new Error('Failed to fetch property')
  }
  
  return data
}

// Create a new property
export async function createProperty(property: Omit<Property, 'id'>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('property')
    .insert([property])
    .select()
  
  if (error) {
    console.error('Error creating property:', error)
    throw new Error('Failed to create property')
  }
  
  revalidatePath('/dashboard/properties')
  return data[0]
}

// Update an existing property
export async function updateProperty(id: number, property: Partial<Property>) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('property')
    .update(property)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error(`Error updating property with ID ${id}:`, error)
    throw new Error('Failed to update property')
  }
  
  revalidatePath('/dashboard/properties')
  return data[0]
}

// Delete a property
export async function deleteProperty(id: number) {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('property')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error(`Error deleting property with ID ${id}:`, error)
    throw new Error('Failed to delete property')
  }
  
  revalidatePath('/dashboard/properties')
  return true
}

// Seed the database with mock properties
export async function seedProperties(count: number = 50, skipRevalidation = false) {
  const supabase = createSupabaseClient()
  
  // First check if we already have properties
  const { count: existingCount, error: countError } = await supabase
    .from('property')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error checking existing properties:', countError)
    throw new Error('Failed to check existing properties')
  }
  
  // If we already have properties, don't seed
  if (existingCount && existingCount > 0) {
    return { message: `Database already has ${existingCount} properties. Skipping seed.` }
  }
  
  // Import mock data generator
  const { generateMockProperties } = await import('@/lib/mock-data')
  
  // Generate mock properties without IDs (database will assign them)
  const mockProperties = generateMockProperties(count).map(property => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...propertyWithoutId } = property
    return propertyWithoutId
  })
  
  // Insert mock properties
  const { data, error } = await supabase
    .from('property')
    .insert(mockProperties)
    .select()
  
  if (error) {
    console.error('Error seeding properties:', error)
    throw new Error('Failed to seed properties')
  }
  
  if (!skipRevalidation) {
    revalidatePath('/dashboard/properties')
  }
  
  return { message: `Successfully seeded ${mockProperties.length} properties` }
} 