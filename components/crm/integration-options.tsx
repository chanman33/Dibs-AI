"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// CRM integration options
const crmOptions = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect to your HubSpot CRM to sync contacts and deals.",
    logo: "https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_the-logo.svg",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Integrate with Salesforce to manage your real estate pipeline.",
    logo: "https://www.salesforce.com/content/dam/web/en_us/www/images/home/logo-salesforce.svg",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "Sync your real estate contacts with Zoho CRM.",
    logo: "https://www.zohowebstatic.com/sites/default/files/zoho-logo.svg",
  },
  {
    id: "followupboss",
    name: "Follow Up Boss",
    description: "Real estate specific CRM for lead management and follow-ups.",
    logo: "https://followupboss.com/wp-content/themes/followupboss-v2/assets/images/logo.svg",
  },
  {
    id: "liondesk",
    name: "LionDesk",
    description: "Real estate CRM with marketing automation and lead management.",
    logo: "https://www.liondesk.com/wp-content/uploads/2021/07/liondesk-logo.svg",
  },
]

export function IntegrationOptions() {
  const [selectedCrm, setSelectedCrm] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
      // In a real app, this would redirect to OAuth flow or API connection
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">CRM Integrations</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Connect New CRM</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect to External CRM</DialogTitle>
              <DialogDescription>
                Link your existing CRM to sync contacts and deals.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="api">API Key</TabsTrigger>
                <TabsTrigger value="oauth">OAuth</TabsTrigger>
              </TabsList>
              <TabsContent value="api" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="crm-type">CRM Platform</Label>
                  <select
                    id="crm-type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    onChange={(e) => setSelectedCrm(e.target.value)}
                  >
                    <option value="">Select CRM...</option>
                    {crmOptions.map((crm) => (
                      <option key={crm.id} value={crm.id}>
                        {crm.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" placeholder="Enter your API key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret (if required)</Label>
                  <Input id="api-secret" type="password" placeholder="Enter your API secret" />
                </div>
              </TabsContent>
              <TabsContent value="oauth" className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oauth-crm">Select CRM Platform</Label>
                    <select
                      id="oauth-crm"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      onChange={(e) => setSelectedCrm(e.target.value)}
                    >
                      <option value="">Select CRM...</option>
                      {crmOptions.map((crm) => (
                        <option key={crm.id} value={crm.id}>
                          {crm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You will be redirected to the CRM provider to authorize access.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                onClick={handleConnect}
                disabled={!selectedCrm || isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {crmOptions.map((crm) => (
          <Card key={crm.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="h-12 w-full flex items-center">
                <div className="h-8 w-auto max-w-[120px] text-lg font-bold">
                  {crm.name}
                </div>
              </div>
              <CardDescription>{crm.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Sync contacts, deals, and communication history.
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
              <Button size="sm">Connect</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 