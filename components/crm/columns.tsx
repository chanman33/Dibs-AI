"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { deleteClient } from "@/app/actions/client-actions"
import { toast } from "sonner"

// Define the client type based on our Prisma schema
export type Client = {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  status: string
  source: string | null
  last_contact_date: Date | null
  next_follow_up: Date | null
  budget_min: number | null
  budget_max: number | null
  property_type: string | null
  assigned_agent: string | null
  notes: string | null
}

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "lead":
      return "bg-blue-500"
    case "active":
      return "bg-green-500"
    case "closed":
      return "bg-purple-500"
    case "lost":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Column definitions with actions
export const createColumns = (
  onEdit?: (client: Client) => void,
  onDelete?: (id: number) => void
): ColumnDef<Client>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    id: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.first_name} {row.original.last_name}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.email || "-"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.original.phone || "-"}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={`${getStatusColor(row.original.status)}`}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => <div>{row.original.source || "-"}</div>,
  },
  {
    accessorKey: "last_contact_date",
    header: "Last Contact",
    cell: ({ row }) => (
      <div>
        {row.original.last_contact_date
          ? format(new Date(row.original.last_contact_date), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "next_follow_up",
    header: "Next Follow-up",
    cell: ({ row }) => (
      <div>
        {row.original.next_follow_up
          ? format(new Date(row.original.next_follow_up), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original

      const handleDelete = async () => {
        if (onDelete) {
          onDelete(client.id)
        } else {
          try {
            await deleteClient(client.id)
            toast.success("Client deleted successfully")
            // Note: We'd need to refresh the data here, but we're using the callback pattern instead
          } catch (error) {
            console.error(`Error deleting client with ID ${client.id}:`, error)
            toast.error("Failed to delete client")
          }
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.id.toString())}
            >
              Copy client ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit && onEdit(client)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit client
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Default columns without callbacks
export const columns = createColumns() 