"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Client } from "@/components/crm/columns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  client?: Client
  onSave: (client: Partial<Client>) => void
}

export function ClientForm({ isOpen, onClose, client, onSave }: ClientFormProps) {
  const isEditing = !!client
  
  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "Lead",
      source: "",
      notes: "",
      property_type: "",
      assigned_agent: "",
    }
  )
  
  const [lastContactDate, setLastContactDate] = useState<Date | undefined>(
    client?.last_contact_date ? new Date(client.last_contact_date) : undefined
  )
  
  const [nextFollowUp, setNextFollowUp] = useState<Date | undefined>(
    client?.next_follow_up ? new Date(client.next_follow_up) : undefined
  )
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedClient = {
      ...formData,
      last_contact_date: lastContactDate,
      next_follow_up: nextFollowUp,
    }
    
    onSave(updatedClient)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the client information below."
              : "Fill in the details to add a new client to your CRM."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                name="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <select
                id="source"
                name="source"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.source || ""}
                onChange={handleChange}
              >
                <option value="">Select Source...</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Zillow">Zillow</option>
                <option value="Realtor.com">Realtor.com</option>
                <option value="Social Media">Social Media</option>
                <option value="Open House">Open House</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_contact_date">Last Contact Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !lastContactDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastContactDate ? format(lastContactDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={lastContactDate}
                    onSelect={setLastContactDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_follow_up">Next Follow-up</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextFollowUp && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextFollowUp ? format(nextFollowUp, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextFollowUp}
                    onSelect={setNextFollowUp}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <select
                id="property_type"
                name="property_type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.property_type || ""}
                onChange={handleChange}
              >
                <option value="">Select Property Type...</option>
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Multi-Family">Multi-Family</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_agent">Assigned Agent</Label>
              <select
                id="assigned_agent"
                name="assigned_agent"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.assigned_agent || ""}
                onChange={handleChange}
              >
                <option value="">Select Agent...</option>
                <option value="John Smith">John Smith</option>
                <option value="Sarah Johnson">Sarah Johnson</option>
                <option value="Michael Williams">Michael Williams</option>
                <option value="Jessica Brown">Jessica Brown</option>
                <option value="David Miller">David Miller</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Add any additional notes about this client..."
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Add"} Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 