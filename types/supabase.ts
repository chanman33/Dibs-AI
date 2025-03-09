export type Database = {
  public: {
    Tables: {
      user: {
        Row: {
          id: number
          created_time: string
          email: string
          first_name: string | null
          last_name: string | null
          gender: string | null
          profile_image_url: string | null
          user_id: string
          subscription: string | null
        }
        Insert: {
          id?: number
          created_time?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          gender?: string | null
          profile_image_url?: string | null
          user_id: string
          subscription?: string | null
        }
        Update: {
          id?: number
          created_time?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          gender?: string | null
          profile_image_url?: string | null
          user_id?: string
          subscription?: string | null
        }
      }
      conversation: {
        Row: {
          id: number
          title: string | null
          user_id: string
          created_time: string
          updated_time: string
          property_id: number | null
        }
        Insert: {
          id?: number
          title?: string | null
          user_id: string
          created_time?: string
          updated_time?: string
          property_id?: number | null
        }
        Update: {
          id?: number
          title?: string | null
          user_id?: string
          created_time?: string
          updated_time?: string
          property_id?: number | null
        }
      }
      message: {
        Row: {
          id: number
          content: string
          role: 'user' | 'assistant'
          created_time: string
          conversation_id: number
        }
        Insert: {
          id?: number
          content: string
          role: 'user' | 'assistant'
          created_time?: string
          conversation_id: number
        }
        Update: {
          id?: number
          content?: string
          role?: 'user' | 'assistant'
          created_time?: string
          conversation_id?: number
        }
      }
      property: {
        Row: {
          id: number
          address: string
          city: string
          state: string
          zip: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          description: string | null
          image_url: string | null
          created_time: string
          updated_time: string
        }
        Insert: {
          id?: number
          address: string
          city: string
          state: string
          zip: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          description?: string | null
          image_url?: string | null
          created_time?: string
          updated_time?: string
        }
        Update: {
          id?: number
          address?: string
          city?: string
          state?: string
          zip?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          description?: string | null
          image_url?: string | null
          created_time?: string
          updated_time?: string
        }
      }
      payments: {
        Row: {
          id: number
          user_id: string
          amount: number
          currency: string
          status: string
          created_time: string
        }
        Insert: {
          id?: number
          user_id: string
          amount: number
          currency: string
          status: string
          created_time?: string
        }
        Update: {
          id?: number
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          created_time?: string
        }
      }
      subscriptions: {
        Row: {
          id: number
          user_id: string
          status: string
          plan_id: number
          current_period_end: string
          created_time: string
          updated_time: string
        }
        Insert: {
          id?: number
          user_id: string
          status: string
          plan_id: number
          current_period_end: string
          created_time?: string
          updated_time?: string
        }
        Update: {
          id?: number
          user_id?: string
          status?: string
          plan_id?: number
          current_period_end?: string
          created_time?: string
          updated_time?: string
        }
      }
      subscriptions_plans: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          currency: string
          interval: string
          created_time: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          price: number
          currency: string
          interval: string
          created_time?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          currency?: string
          interval?: string
          created_time?: string
        }
      }
      invoices: {
        Row: {
          id: number
          user_id: string
          amount: number
          currency: string
          status: string
          invoice_url: string | null
          created_time: string
          subscription_id: number | null
        }
        Insert: {
          id?: number
          user_id: string
          amount: number
          currency: string
          status: string
          invoice_url?: string | null
          created_time?: string
          subscription_id?: number | null
        }
        Update: {
          id?: number
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          invoice_url?: string | null
          created_time?: string
          subscription_id?: number | null
        }
      }
    }
  }
} 