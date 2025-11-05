"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FiCalendar } from "react-icons/fi";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

// ✅ Import slices
import { fetchGames as fetchMainGames } from "@/redux/slices/mainMarketSlice";
import { fetchGames as fetchStarlineGames } from "@/redux/slices/starlineSlice";
import { fetchGames as fetchGalidisawarGames } from "@/redux/slices/galidisawarSlice";

export default function RevertBidsForm() {
  const [marketType, setMarketType] = useState("mainmarket");
  const [date, setDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [gameId, setGameId] = useState("");

  const dispatch = useAppDispatch();

  // ✅ Select games from Redux
  const { games: mainGames } = useAppSelector((state) => state.mainMarket);
  const { games: starlineGames } = useAppSelector((state) => state.starline);
  const { games: galidisawarGames } = useAppSelector((state) => state.galidisawar);

  useEffect(() => {
    dispatch(fetchMainGames({}));
    dispatch(fetchStarlineGames({}));
    dispatch(fetchGalidisawarGames({}));
  }, [dispatch]);

  const handleDeleteBids = async () => {
    if (!marketType || !date || !gameId) {
      toast.warning("Please select market type, game, and date");
      return;
    }

    if (!window.confirm("Are you sure you want to revert these bids?")) return;

    setIsLoading(true);
    try {
      // ✅ Call the new API route
      const response = await fetch("/api/revert-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market_type: marketType,
          game_id: gameId,
          date: format(date, "yyyy-MM-dd"),
        }),
      });

      const result = await response.json();

      if (result.status) {
        toast.success(result.message || "Bids reverted successfully");
        setGameId("");
        setDate(undefined);
      } else {
        toast.error(result.message || "Failed to revert bids");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error reverting bids");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getGames = () => {
    switch (marketType) {
      case "mainmarket":
        return mainGames;
      case "starline":
        return starlineGames;
      case "galidisawar":
        return galidisawarGames;
      default:
        return [];
    }
  };

  const getMarketLabel = (type: string) => {
    switch (type) {
      case "mainmarket":
        return "Main Market";
      case "starline":
        return "Starline";
      case "galidisawar":
        return "Galidisawar";
      default:
        return "Selected";
    }
  };

  return (
    <Card className="w-full border-0 bg-transparent space-y-2">
      <CardHeader>
        <CardTitle className="text-center">Bid Revert</CardTitle>
        <p className="text-sm text-center text-destructive">
          ⚠️ Careful! Reverted bids cannot be recovered.
        </p>
      </CardHeader>

      <CardContent>
        <Tabs
          defaultValue="mainmarket"
          value={marketType}
          onValueChange={setMarketType}
          className="w-full"
        >
          <TabsList className="w-full flex justify-center mb-4 bg-white dark:bg-gray-800">
            <TabsTrigger value="mainmarket">Main Market</TabsTrigger>
            <TabsTrigger value="starline">Starline</TabsTrigger>
            <TabsTrigger value="galidisawar">Galidisawar</TabsTrigger>
          </TabsList>

          <TabsContent value="mainmarket">
            <MarketSection
              games={getGames()}
              gameId={gameId}
              setGameId={setGameId}
              date={date}
              setDate={setDate}
              isLoading={isLoading}
              handleDeleteBids={handleDeleteBids}
              marketLabel={getMarketLabel(marketType)}
            />
          </TabsContent>

          <TabsContent value="starline">
            <MarketSection
              games={getGames()}
              gameId={gameId}
              setGameId={setGameId}
              date={date}
              setDate={setDate}
              isLoading={isLoading}
              handleDeleteBids={handleDeleteBids}
              marketLabel={getMarketLabel(marketType)}
            />
          </TabsContent>

          <TabsContent value="galidisawar">
            <MarketSection
              games={getGames()}
              gameId={gameId}
              setGameId={setGameId}
              date={date}
              setDate={setDate}
              isLoading={isLoading}
              handleDeleteBids={handleDeleteBids}
              marketLabel={getMarketLabel(marketType)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MarketSection({
  games,
  gameId,
  setGameId,
  date,
  setDate,
  isLoading,
  handleDeleteBids,
  marketLabel,
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Game Selector */}
        <Select onValueChange={setGameId} value={gameId}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Select Game" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900">
            {games?.length > 0 ? (
              games.map((game: any) => (
                <SelectItem key={game._id} value={game._id}>
                  {game.game_name}
                </SelectItem>
              ))
            ) : (
              <div className="text-sm text-gray-500 p-2">No games found</div>
            )}
          </SelectContent>
        </Select>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              <FiCalendar className="mr-2 h-4 w-4" />
              <span>{date ? format(date, "PPP") : "Select Date"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Submit Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDeleteBids}
          disabled={isLoading || !date || !gameId}
        >
          {isLoading ? "Reverting..." : `Revert ${marketLabel} Bids`}
        </Button>
      </div>
    </div>
  );
}
