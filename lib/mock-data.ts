import { Client } from "@/components/crm/columns"
import { addDays, subDays } from "date-fns"

// Status options
const statuses = ["Lead", "Active", "Closed", "Lost"]

// Source options
const sources = [
  "Referral",
  "Website",
  "Zillow",
  "Realtor.com",
  "Social Media",
  "Open House",
  "Cold Call",
  "Other"
]

// Property types
const propertyTypes = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
  "Land",
  "Commercial"
]

// Agent names
const agents = [
  "John Smith",
  "Sarah Johnson",
  "Michael Williams",
  "Jessica Brown",
  "David Miller"
]

// First names
const firstNames = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna",
  "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa"
]

// Last names
const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell"
]

// Simple deterministic pseudo-random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  // Generate a number between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate an integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick a random element from an array
  pickElement<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Random boolean with probability
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }
}

// Create a seeded random generator
const random = new SeededRandom(42); // Fixed seed for consistent results

// Generate a single mock client
const generateMockClient = (id: number): Client => {
  const firstName = random.pickElement(firstNames);
  const lastName = random.pickElement(lastNames);
  const status = random.pickElement(statuses);
  const source = random.pickElement(sources);
  const propertyType = random.pickElement(propertyTypes);
  const agent = random.nextBool(0.7) ? random.pickElement(agents) : null;
  
  // Budget range
  const minBudget = random.nextInt(100000, 900000);
  const maxBudget = minBudget + random.nextInt(50000, 500000);
  
  // Dates - use fixed date references to avoid hydration issues
  const now = new Date('2024-03-09T00:00:00Z');
  const lastContactDate = random.nextBool(0.9) 
    ? new Date(now.getTime() - random.nextInt(1, 90) * 24 * 60 * 60 * 1000) 
    : null;
  const nextFollowUp = random.nextBool(0.7) 
    ? new Date(now.getTime() + random.nextInt(1, 30) * 24 * 60 * 60 * 1000) 
    : null;
  
  // Generate email with deterministic logic
  const email = random.nextBool(0.95) 
    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${
        ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'][random.nextInt(0, 4)]
      }` 
    : null;
  
  // Generate phone with deterministic logic
  const phone = random.nextBool(0.9) 
    ? `(${random.nextInt(200, 999)}) ${random.nextInt(200, 999)}-${random.nextInt(1000, 9999)}` 
    : null;
  
  return {
    id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    status,
    source,
    last_contact_date: lastContactDate,
    next_follow_up: nextFollowUp,
    budget_min: minBudget,
    budget_max: maxBudget,
    property_type: propertyType,
    assigned_agent: agent,
    notes: random.nextBool(0.7) ? `Client notes for ${firstName} ${lastName}` : null
  }
}

// Generate an array of mock clients
export const generateMockClients = (count: number = 100): Client[] => {
  return Array.from({ length: count }, (_, i) => generateMockClient(i + 1))
}

// Export a pre-generated set of clients for consistent data
export const mockClients = generateMockClients(50) 