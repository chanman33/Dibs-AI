"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/crm/data-table"
import { columns, Client, createColumns } from "@/components/crm/columns"
import { ClientForm } from "@/components/crm/client-form"
import { IntegrationOptions } from "@/components/crm/integration-options"
import { PlusCircle, Users, BarChart3, Settings, RefreshCw, Database } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { getClients, createClient, updateClient, deleteClient, seedClients } from "@/app/actions/client-actions"
import { toast } from "sonner"

export default function CrmPage() {
  // Use null as initial state to prevent hydration mismatch
  const [clients, setClients] = useState<Client[] | null>(null)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("clients")
  const [isLoading, setIsLoading] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Load clients from the database
  const loadClients = async () => {
    try {
      setIsLoading(true)
      const data = await getClients()
      setClients(data as Client[])
    } catch (error) {
      console.error("Error loading clients:", error)
      toast.error("Failed to load clients")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize client data on the client side only
  useEffect(() => {
    loadClients()
  }, [])

  const handleAddClient = async (client: Partial<Client>) => {
    try {
      const newClient = await createClient(client as Omit<Client, "id">)
      toast.success("Client added successfully")
      await loadClients() // Reload clients from the database
    } catch (error) {
      console.error("Error adding client:", error)
      toast.error("Failed to add client")
    }
  }

  const handleEditClient = async (client: Partial<Client>) => {
    if (!selectedClient) return

    try {
      await updateClient(selectedClient.id, client)
      toast.success("Client updated successfully")
      await loadClients() // Reload clients from the database
      setSelectedClient(undefined)
    } catch (error) {
      console.error("Error updating client:", error)
      toast.error("Failed to update client")
    }
  }

  const handleDeleteClient = async (id: number) => {
    try {
      await deleteClient(id)
      toast.success("Client deleted successfully")
      await loadClients() // Reload clients from the database
    } catch (error) {
      console.error("Error deleting client:", error)
      toast.error("Failed to delete client")
    }
  }

  const handleSaveClient = (client: Partial<Client>) => {
    if (selectedClient) {
      handleEditClient(client)
    } else {
      handleAddClient(client)
    }
  }

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true)
      const result = await seedClients(50)
      toast.success(result.message)
      await loadClients() // Reload clients from the database
    } catch (error) {
      console.error("Error seeding database:", error)
      toast.error("Failed to seed database")
    } finally {
      setIsSeeding(false)
    }
  }

  // Create columns with edit and delete handlers
  const clientColumns = createColumns(
    (client) => setSelectedClient(client),
    handleDeleteClient
  )

  // Calculate metrics only when clients are loaded
  const leadCount = clients?.filter((client) => client.status === "Lead").length || 0
  const activeCount = clients?.filter((client) => client.status === "Active").length || 0
  const closedCount = clients?.filter((client) => client.status === "Closed").length || 0
  const lostCount = clients?.filter((client) => client.status === "Lost").length || 0

  return (
    <main className="flex flex-col gap-6 p-6 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Real Estate CRM</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadClients}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
          <Button size="sm" onClick={() => setIsAddClientOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadCount}</div>
            <p className="text-xs text-muted-foreground">
              Potential clients in your pipeline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Clients actively working with you
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully closed transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Opportunities</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lostCount}</div>
            <p className="text-xs text-muted-foreground">
              Clients who went elsewhere
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="integrations">CRM Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="clients" className="space-y-4">
          {clients ? (
            <>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isSeeding ? "Seeding..." : "Seed Database"}
                </Button>
              </div>
              <DataTable columns={clientColumns} data={clients} searchKey="name" />
            </>
          ) : (
            <div className="flex h-24 items-center justify-center">
              <p className="text-muted-foreground">Loading client data...</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationOptions />
        </TabsContent>
      </Tabs>

      <ClientForm
        isOpen={isAddClientOpen || !!selectedClient}
        onClose={() => {
          setIsAddClientOpen(false)
          setSelectedClient(undefined)
        }}
        client={selectedClient}
        onSave={handleSaveClient}
      />
    </main>
  )
}
