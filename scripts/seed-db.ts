import 'dotenv/config'
import { seedClients } from '@/app/actions/client-actions'
import { seedProperties } from '@/app/actions/property-actions'
import { createClient } from '@/lib/supabase/server'

async function main() {
  try {
    const force = process.argv.includes('--force')
    
    if (force) {
      console.log('Forcing reseed - deleting existing data...')
      const supabase = createClient()
      
      // Delete all clients
      console.log('Deleting existing clients...')
      const { error: clientError } = await supabase.from('client').delete().neq('id', 0)
      if (clientError) {
        throw new Error('Failed to delete existing clients: ' + clientError.message)
      }
      
      // Delete all properties
      console.log('Deleting existing properties...')
      const { error: propertyError } = await supabase.from('property').delete().neq('id', 0)
      if (propertyError) {
        throw new Error('Failed to delete existing properties: ' + propertyError.message)
      }
    }

    // Seed properties first (since they might be referenced by clients later)
    console.log('Seeding properties...')
    const propertyResult = await seedProperties(50, true)
    console.log(propertyResult.message)

    // Then seed clients
    console.log('Seeding clients...')
    const clientResult = await seedClients(50, true)
    console.log(clientResult.message)

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Failed to seed database:', error)
    process.exit(1)
  }
}

main() 