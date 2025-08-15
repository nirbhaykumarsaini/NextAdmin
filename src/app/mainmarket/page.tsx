"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'

// Define the schema for form validation
const formSchema = z.object({
  gameName: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  openTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:MM format",
  }),
  closeTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:MM format",
  }),
})

// Type for our game data
type Game = {
  id: string
  gameName: string
  openTime: string
  closeTime: string,
  isActive: boolean,
  marketstaus: boolean
}

const MainMarket = () => {
  const [games, setGames] = useState<Game[]>([
    { id: '1', gameName: 'Poker', openTime: '10:00', closeTime: '22:00', isActive: true, marketstaus: false },
    { id: '2', gameName: 'Blackjack', openTime: '12:00', closeTime: '00:00', isActive: false, marketstaus: true },
    { id: '3', gameName: 'Roulette', openTime: '14:00', closeTime: '02:00', isActive: true, marketstaus: false },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: "",
      openTime: "",
      closeTime: "",
    },
  })

  // Handle form submission
 
  // Handle edit
  const handleEdit = (game: Game) => {
    form.setValue('gameName', game.gameName)
    form.setValue('openTime', game.openTime)
    form.setValue('closeTime', game.closeTime)
    setEditingId(game.id)
  }

  // Handle delete
  const handleDelete = (id: string) => {
    setGames(games.filter(game => game.id !== id))
    if (editingId === id) {
      setEditingId(null)
      form.reset()
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Game Management</h1>

      <div className="space-y-6">
        {/* Game Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Game' : 'Add New Game'}
          </h2>

          <Form {...form} >
            <form  className="space-y-4 " >
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                control={form.control}
                name="gameName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter game name" {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type='time' placeholder="09:00" {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closeTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Close Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type='time' placeholder="23:00" {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Game' : 'Add Game'}
                </Button>

                {editingId && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Games Table */}
        <div className='rounded-md border'>
          <Table>
            {/* <TableCaption>A list of available games.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>S. No.</TableHead>
                <TableHead>Game Name</TableHead>
                <TableHead>Open Time</TableHead>
                <TableHead>Close Time</TableHead>
                <TableCell>Status</TableCell>
                <TableCell>Market Status</TableCell>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                   <TableCell>{game.id}</TableCell>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>{game.openTime}</TableCell>
                  <TableCell>{game.closeTime}</TableCell>
                  <TableCell>
                    <Badge
                      variant={game.isActive === true ? 'default' : 'secondary'}
                      className={game.isActive === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    >
                      {game.isActive === true ? "Active" : "InActive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={game.marketstaus === true ? 'default' : 'secondary'}
                      className={game.marketstaus === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    >
                      {game.marketstaus === true ? "Open" : "Close"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon" className="text-primary hover:text-primary/80"
                      onClick={() => handleEdit(game)}
                    >
                      <FiEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon" className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDelete(game.id)}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
        </div>

        <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">
              3
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      </div>
    </div>
  )
}

export default MainMarket