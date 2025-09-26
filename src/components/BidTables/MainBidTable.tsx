import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FiEdit } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '../ui/button';
import { Bid } from '@/app/mainmarketbidreports/page';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';

interface MainBidTableProps {
  bids: Bid[]
  loading: boolean
  formatGameType: (type: string) => string
  formatCurrency: (amount: number) => string
  onEditBid: (bid: Bid) => void
}

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const MainBidTable = ({ bids, loading, formatGameType, formatCurrency, onEditBid }: MainBidTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalItems = bids.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBids = bids.slice(startIndex, endIndex);

  // Reset to first page when bids change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [bids]);

  // Generate pagination range
  const getPaginationRange = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Game Type</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Digit</TableHead>
            <TableHead>Panna</TableHead>
            <TableHead>Open Panna</TableHead>
            <TableHead>Close Panna</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : bids.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                No bids found
              </TableCell>
            </TableRow>
          ) : (
            currentBids.map((bid, index) => (
              <TableRow key={bid._id}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>{formatDate(bid.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {bid.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link className='underline text-blue-500 capitalize' href={`/user-details?userId=${bid.user_id}`}>
                      <div className="font-medium">{bid.name}</div>
                    </Link>
                  </div>
                </TableCell>
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
                <TableCell>{bid.digit || '-'}</TableCell>
                <TableCell>{bid.panna || '-'}</TableCell>
                <TableCell>{bid.open_panna || '-'}</TableCell>
                <TableCell>{bid.close_panna || '-'}</TableCell>
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

      {/* Pagination */}
      {!loading && bids.length > 0 && (
        <div className="flex flex-col gap-4 p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} bids
          </div>

          {totalPages > 1 && (
            <Pagination className="justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {getPaginationRange().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2">...</span>
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page as number);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default MainBidTable;