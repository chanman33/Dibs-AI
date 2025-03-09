import { createClient } from '@/lib/supabase/server';
import { Client } from '@/components/crm/columns';

/**
 * CRM Tool for AI Agent
 * 
 * This tool allows the AI agent to interact with CRM data,
 * query client information, and perform actions based on user requests.
 */
export class CRMTool {
  // Debug mode flag
  private static debugMode = process.env.NODE_ENV === 'development';
  
  /**
   * Log debug information if debug mode is enabled
   */
  private static logDebug(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[CRM Tool Debug] ${message}`);
      if (data) {
        console.log(data);
      }
    }
  }

  /**
   * Get client information by ID
   */
  static async getClientById(clientId: number): Promise<Client | null> {
    try {
      this.logDebug(`Fetching client with ID: ${clientId}`);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('client')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) {
        console.error(`Error fetching client with ID ${clientId}:`, error);
        this.logDebug(`Error fetching client with ID ${clientId}:`, error);
        return null;
      }
      
      this.logDebug(`Found client with ID ${clientId}:`, data);
      return data as Client;
    } catch (error) {
      console.error('Error in getClientById:', error);
      this.logDebug('Error in getClientById:', error);
      return null;
    }
  }

  /**
   * Search clients by name (first name or last name)
   */
  static async searchClientsByName(name: string): Promise<Client[]> {
    try {
      this.logDebug(`Searching clients with name: ${name}`);
      const supabase = createClient();
      const searchTerm = name.toLowerCase().trim();
      
      // First try exact match on first_name or last_name
      const { data: exactMatches, error: exactError } = await supabase
        .from('client')
        .select('*')
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
      
      if (exactError) {
        console.error(`Error searching clients with exact name ${name}:`, exactError);
        this.logDebug(`Error searching clients with exact name ${name}:`, exactError);
        return [];
      }
      
      if (exactMatches && exactMatches.length > 0) {
        this.logDebug(`Found ${exactMatches.length} clients with exact name match "${name}"`);
        return exactMatches as Client[];
      }
      
      // If no exact matches, try partial match
      const { data: partialMatches, error: partialError } = await supabase
        .from('client')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      
      if (partialError) {
        console.error(`Error searching clients with partial name ${name}:`, partialError);
        this.logDebug(`Error searching clients with partial name ${name}:`, partialError);
        return [];
      }
      
      this.logDebug(`Found ${partialMatches?.length || 0} clients matching name "${name}"`);
      return partialMatches as Client[];
    } catch (error) {
      console.error('Error in searchClientsByName:', error);
      this.logDebug('Error in searchClientsByName:', error);
      return [];
    }
  }

  /**
   * Search clients by email
   */
  static async searchClientsByEmail(email: string): Promise<Client[]> {
    try {
      this.logDebug(`Searching clients with email: ${email}`);
      const supabase = createClient();
      const searchTerm = email.toLowerCase().trim();
      
      // First try exact match
      const { data: exactMatches, error: exactError } = await supabase
        .from('client')
        .select('*')
        .eq('email', searchTerm);
      
      if (exactError) {
        console.error(`Error searching clients with exact email ${email}:`, exactError);
        this.logDebug(`Error searching clients with exact email ${email}:`, exactError);
        return [];
      }
      
      if (exactMatches && exactMatches.length > 0) {
        this.logDebug(`Found ${exactMatches.length} clients with exact email match "${email}"`);
        return exactMatches as Client[];
      }
      
      // If no exact matches, try partial match
      const { data: partialMatches, error: partialError } = await supabase
        .from('client')
        .select('*')
        .ilike('email', `%${searchTerm}%`);
      
      if (partialError) {
        console.error(`Error searching clients with partial email ${email}:`, partialError);
        this.logDebug(`Error searching clients with partial email ${email}:`, partialError);
        return [];
      }
      
      this.logDebug(`Found ${partialMatches?.length || 0} clients matching email "${email}"`);
      return partialMatches as Client[];
    } catch (error) {
      console.error('Error in searchClientsByEmail:', error);
      this.logDebug('Error in searchClientsByEmail:', error);
      return [];
    }
  }

  /**
   * Get clients by status
   */
  static async getClientsByStatus(status: string): Promise<Client[]> {
    try {
      this.logDebug(`Fetching clients with status: ${status}`);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('client')
        .select('*')
        .eq('status', status);
      
      if (error) {
        console.error(`Error fetching clients with status ${status}:`, error);
        this.logDebug(`Error fetching clients with status ${status}:`, error);
        return [];
      }
      
      this.logDebug(`Found ${data?.length || 0} clients with status "${status}"`);
      return data as Client[];
    } catch (error) {
      console.error('Error in getClientsByStatus:', error);
      this.logDebug('Error in getClientsByStatus:', error);
      return [];
    }
  }

  /**
   * Update client information
   */
  static async updateClient(clientId: number, updates: Partial<Client>): Promise<Client | null> {
    try {
      this.logDebug(`Updating client with ID ${clientId}:`, updates);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('client')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating client with ID ${clientId}:`, error);
        this.logDebug(`Error updating client with ID ${clientId}:`, error);
        return null;
      }
      
      this.logDebug(`Successfully updated client with ID ${clientId}:`, data);
      return data as Client;
    } catch (error) {
      console.error('Error in updateClient:', error);
      this.logDebug('Error in updateClient:', error);
      return null;
    }
  }

  /**
   * Get clients with upcoming follow-ups
   */
  static async getClientsWithUpcomingFollowUps(days: number = 7): Promise<Client[]> {
    try {
      this.logDebug(`Fetching clients with follow-ups in the next ${days} days`);
      const supabase = createClient();
      
      // Calculate the date range
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      this.logDebug(`Date range: ${today.toISOString()} to ${futureDate.toISOString()}`);
      
      const { data, error } = await supabase
        .from('client')
        .select('*')
        .gte('next_follow_up', today.toISOString())
        .lte('next_follow_up', futureDate.toISOString())
        .order('next_follow_up', { ascending: true });
      
      if (error) {
        console.error(`Error fetching clients with upcoming follow-ups:`, error);
        this.logDebug(`Error fetching clients with upcoming follow-ups:`, error);
        return [];
      }
      
      this.logDebug(`Found ${data?.length || 0} clients with follow-ups in the next ${days} days`);
      return data as Client[];
    } catch (error) {
      console.error('Error in getClientsWithUpcomingFollowUps:', error);
      this.logDebug('Error in getClientsWithUpcomingFollowUps:', error);
      return [];
    }
  }

  /**
   * Seed the database with test client data
   * This is useful for testing the CRM integration
   */
  static async seedTestClients(): Promise<boolean> {
    try {
      this.logDebug('Seeding test client data');
      const supabase = createClient();
      
      // Check if we already have test clients
      const { count, error: countError } = await supabase
        .from('client')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking existing clients:', countError);
        this.logDebug('Error checking existing clients:', countError);
        return false;
      }
      
      // If we already have clients, don't seed
      if (count && count > 0) {
        this.logDebug(`Database already has ${count} clients. Skipping seed.`);
        return true;
      }
      
      // Sample test clients
      const testClients = [
        {
          first_name: 'Anthony',
          last_name: 'Young',
          email: 'anthony.young@hotmail.com',
          phone: '555-123-4567',
          status: 'Active',
          source: 'Website',
          notes: 'Looking for a 3-bedroom house in the suburbs',
          last_contact_date: new Date().toISOString(),
          next_follow_up: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          budget_min: 300000,
          budget_max: 450000,
          property_type: 'Single Family',
          bedrooms: 3,
          bathrooms: 2,
          square_feet_min: 1800,
          square_feet_max: 2500,
          preferred_areas: ['Oakwood', 'Riverside'],
          assigned_agent: 'Sarah Johnson'
        },
        {
          first_name: 'Emily',
          last_name: 'Parker',
          email: 'emily.parker@example.com',
          phone: '555-987-6543',
          status: 'Lead',
          source: 'Zillow',
          notes: 'Interested in downtown condos',
          last_contact_date: new Date().toISOString(),
          next_follow_up: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          budget_min: 200000,
          budget_max: 350000,
          property_type: 'Condo',
          bedrooms: 2,
          bathrooms: 2,
          square_feet_min: 1000,
          square_feet_max: 1500,
          preferred_areas: ['Downtown', 'Midtown'],
          assigned_agent: 'Michael Brown'
        },
        {
          first_name: 'Robert',
          last_name: 'Johnson',
          email: 'robert.johnson@example.com',
          phone: '555-456-7890',
          status: 'Closed',
          source: 'Referral',
          notes: 'Purchased a 4-bedroom house in Oakwood',
          last_contact_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_follow_up: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          budget_min: 400000,
          budget_max: 600000,
          property_type: 'Single Family',
          bedrooms: 4,
          bathrooms: 3,
          square_feet_min: 2500,
          square_feet_max: 3500,
          preferred_areas: ['Oakwood', 'Highland'],
          assigned_agent: 'Sarah Johnson'
        },
        {
          first_name: 'Jennifer',
          last_name: 'Smith',
          email: 'jennifer.smith@example.com',
          phone: '555-789-0123',
          status: 'Active',
          source: 'Website',
          notes: 'Looking for investment properties',
          last_contact_date: new Date().toISOString(),
          next_follow_up: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          budget_min: 150000,
          budget_max: 250000,
          property_type: 'Multi-Family',
          bedrooms: 2,
          bathrooms: 1,
          square_feet_min: 1000,
          square_feet_max: 1800,
          preferred_areas: ['Westside', 'Southpark'],
          assigned_agent: 'Michael Brown'
        },
        {
          first_name: 'David',
          last_name: 'Miller',
          email: 'david.miller@example.com',
          phone: '555-321-6547',
          status: 'Lost',
          source: 'Zillow',
          notes: 'Was looking for a luxury condo but decided to rent instead',
          last_contact_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          next_follow_up: null,
          budget_min: 500000,
          budget_max: 750000,
          property_type: 'Condo',
          bedrooms: 3,
          bathrooms: 2.5,
          square_feet_min: 1800,
          square_feet_max: 2200,
          preferred_areas: ['Downtown', 'Riverfront'],
          assigned_agent: 'Sarah Johnson'
        }
      ];
      
      // Insert test clients
      const { data, error } = await supabase
        .from('client')
        .insert(testClients)
        .select();
      
      if (error) {
        console.error('Error seeding test clients:', error);
        this.logDebug('Error seeding test clients:', error);
        return false;
      }
      
      this.logDebug(`Successfully seeded ${testClients.length} test clients`);
      return true;
    } catch (error) {
      console.error('Error in seedTestClients:', error);
      this.logDebug('Error in seedTestClients:', error);
      return false;
    }
  }

  /**
   * Format client data as JSON for the AI agent
   */
  static formatClientAsJson(client: Client): string {
    this.logDebug('Formatting client as JSON:', client);
    return JSON.stringify(client, null, 2);
  }

  /**
   * Format multiple clients as JSON for the AI agent
   */
  static formatClientsAsJson(clients: Client[]): string {
    this.logDebug(`Formatting ${clients.length} clients as JSON`);
    return JSON.stringify(clients, null, 2);
  }
} 