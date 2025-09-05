import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FiEdit } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';

interface Bid {
  _id: string;
  name: string;
  mobile_number: string;
  game_name: string;
  game_type: string;
  session: string;
  digit: string;
  panna: string;
  bid_amount: number;
  created_at: string;
}

interface BidsProps {
  userId: string;
}

const Bids: React.FC<BidsProps> = ({ userId }) => {
  const [activeBidTab, setActiveBidTab] = useState("main");
  const [mainBids, setMainBids] = useState<Bid[]>([]);
  const [starlineBids, setStarlineBids] = useState<Bid[]>([]);
  const [galiBids, setGaliBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    main: false,
    starline: false,
    gali: false
  });

  useEffect(() => {
    if (userId && activeBidTab) {
      fetchBids(activeBidTab);
    }
  }, [userId, activeBidTab]);

  const fetchBids = async (type: string) => {
    try {
      setDataLoading(prev => ({ ...prev, [type]: true }));
      
      let endpoint = '';
      switch (type) {
        case 'main':
          endpoint = `/api/mainmarketbid/user/${userId}`;
          break;
        case 'starline':
          endpoint = `/api/starlinebid/user/${userId}`;
          break;
        case 'gali':
          endpoint = `/api/galidisawarbid/user/${userId}`;
          break;
        default:
          return;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        switch (type) {
          case 'main':
            setMainBids(response.data.data);
            break;
          case 'starline':
            setStarlineBids(response.data.data);
            break;
          case 'gali':
            setGaliBids(response.data.data);
            break;
        }
        toast.success(`Found ${response.data.data.length} ${type} bids`);
      } else {
        toast.error(response.data.message || `Failed to fetch ${type} bids`);
      }
    } catch (error: unknown) {
      console.error(`Error fetching ${type} bids:`, error);
      toast.error(`Failed to fetch ${type} bids`);
    } finally {
      setDataLoading(prev => ({ ...prev, [type]: false }));
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const renderBidTable = (bids: Bid[], isLoading: boolean, type: string) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border shadow-sm overflow-hidden">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No {type} bids found
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
                    <Badge variant="secondary">{bid.game_type}</Badge>
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
                  <TableCell className="font-medium">
                    {formatCurrency(bid.bid_amount)}
                  </TableCell>
                  
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <TabsContent value="bids" className="space-y-6">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>User Bids</CardTitle>
          <CardDescription>All bid history for this user across different markets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeBidTab} onValueChange={setActiveBidTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white dark:bg-gray-900">
              <TabsTrigger value="main">Main Market</TabsTrigger>
              <TabsTrigger value="starline">Starline </TabsTrigger>
              <TabsTrigger value="gali">Galidisawar</TabsTrigger>
            </TabsList>

            <TabsContent value="main">
              {renderBidTable(mainBids, dataLoading.main, "main market")}
            </TabsContent>

            <TabsContent value="starline">
              {renderBidTable(starlineBids, dataLoading.starline, "starline")}
            </TabsContent>

            <TabsContent value="gali">
              {renderBidTable(galiBids, dataLoading.gali, "gali disawar")}
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Total bids: 
              <span className="font-semibold ml-2">
                {mainBids.length + starlineBids.length + galiBids.length}
              </span>
            </p>
            <p>Main Market: {mainBids.length} | Starline: {starlineBids.length} | Gali Disawar: {galiBids.length}</p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default Bids;