import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { FiEdit } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '../ui/button';
import { Bid } from '@/app/mainmarketbidreports/page';

interface MainBidTableProps {
  bids: Bid[]
  loading: boolean
  formatGameType: (type: string) => string
  formatCurrency: (amount: number) => string
  onEditBid: (bid: Bid) => void
}

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",  // or "long" for full month name
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // ensures AM/PM format
  });
};

const MainBidTable = ({ bids, loading, formatGameType, formatCurrency, onEditBid }: MainBidTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S. No.</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Game Type</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Digit</TableHead>
            <TableHead>Panna</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: bids?.length }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : bids?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No bids found
              </TableCell>
            </TableRow>
          ) : (
            bids.map((bid, index) => (
              <TableRow key={`${bid._id}-${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{formatDate(bid.created_at)}</TableCell>
                <TableCell>{bid.name || 'N/A'}</TableCell>
                <TableCell>{bid.game_name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{formatGameType(bid.game_type)}</Badge>
                </TableCell>
                <TableCell>
                  {bid.session ? (
                    <Badge variant={bid.session === 'open' ? 'default' : 'secondary'}>
                      {bid.session.toUpperCase()}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {bid.digit || '-'}
                </TableCell>
                <TableCell>
                  { bid.panna || '-'}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(bid.bid_amount)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditBid(bid)}
                  >
                    <FiEdit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default MainBidTable