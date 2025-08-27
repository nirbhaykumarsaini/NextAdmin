"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiEdit, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchGames,
  createGame,
  updateGame,
  deleteGame,
  updateMarketStatus,
  toggleGameStatus,
  clearError,
} from "@/redux/slices/mainMarketSlice";
import { IMainMarketGame, IMainMarketGameDay } from "@/models/MainMarketGame";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------------- Schema ----------------
const formSchema = z.object({
  game_name: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  days: z.array(
    z.object({
      day: z.string(),
      open_time: z.string(),
      close_time: z.string(),
      market_status: z.boolean(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------- Constants ----------------
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ---------------- Main Component ----------------
const MainMarket = () => {
  const dispatch = useAppDispatch();
  const { games, loading, error, currentPage } = useAppSelector(
    (state) => state.mainMarket
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [marketStatusDialogOpen, setMarketStatusDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<IMainMarketGame | null>(null);
  const [selectedGameDays, setSelectedGameDays] = useState<IMainMarketGameDay[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      game_name: "",
      days: DAYS_OF_WEEK.map((day) => ({
        day,
        open_time: "",
        close_time: "",
        market_status: false
      })),
    },
  });

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ---------------- Utils ----------------
  const getTodayDayName = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  // ---------------- Submit ----------------
  const onSubmit = async (values: FormValues) => {
    try {
      const gameData = {
        game_name: values.game_name,
        days: values.days,
        is_active: true,
      };

      if (editingId) {
        await dispatch(updateGame({ id: editingId, gameData })).unwrap();
        toast.success("Game updated successfully");
      } else {
        await dispatch(createGame(gameData)).unwrap();
        toast.success("Game created successfully");
      }
      await dispatch(fetchGames());
      form.reset();
      setEditingId(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || `Failed to ${editingId ? "update" : "create"} game`);
      } else {
        toast.error(`Failed to ${editingId ? "update" : "create"} game`);
      }
    }
  };

  // ---------------- Edit/Delete ----------------
  const handleEdit = (game: IMainMarketGame) => {
    form.setValue("game_name", game.game_name);
    form.setValue("days", game.days);
    setEditingId(game._id as string);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await dispatch(deleteGame(id)).unwrap();
        toast.success("Game deleted successfully");
        if (editingId === id) {
          setEditingId(null);
          await dispatch(fetchGames());
          form.reset();
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || `Failed to delete game`);
        } else {
          toast.error(`Failed to delete game`);
        }
      }
    }
  };

  // ---------------- Status Toggles ----------------
  const handleGameStatusToggle = async (
    gameId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await dispatch(
        toggleGameStatus({ id: gameId, is_active: !currentStatus })
      ).unwrap();
      if (response.status === false) {
        toast.error(response.message || 'Failed to update status')
      } else {
        await dispatch(fetchGames());
        toast.success(response.message || 'Game status updated successfully')
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || `Failed to update game status`);
      } else {
        toast.error("Failed to update game status");
      }
    }
  };

  const handleRefresh = () => {
    dispatch(fetchGames());
  };

  // ---------------- Market Status Dialog ----------------
  const openMarketStatusDialog = (game: IMainMarketGame) => {
    setSelectedGame(game);
    setSelectedGameDays([...game.days]);
    setMarketStatusDialogOpen(true);
  };

  const closeMarketStatusDialog = () => {
    setMarketStatusDialogOpen(false);
    setSelectedGame(null);
    setSelectedGameDays([]);
  };

  const handleDayStatusChange = (index: number, field: string, value: any) => {
    const updatedDays = [...selectedGameDays];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setSelectedGameDays(updatedDays);
  };

  const saveMarketStatusChanges = async () => {
    if (!selectedGame) return;
    try {
      await dispatch(
        updateMarketStatus({
          id: selectedGame._id as string,
          days: selectedGameDays,
        })
      ).unwrap();

      toast.success("Market status updated successfully");
      await dispatch(fetchGames());
      closeMarketStatusDialog();

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || `Failed to update game market status`);
      } else {
        toast.error("Failed to update game market  status");
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Management</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {/* Game Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Game" : "Add New Game"}
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="game_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter game name" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                {form.watch("days").map((day, index) => (
                  <div
                    key={`day-${day.day}-${index}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg"
                  >
                    <h4 className="md:col-span-3 font-medium">{day.day}</h4>
                    <FormField
                      control={form.control}
                      name={`days.${index}.open_time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Open Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`days.${index}.close_time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Close Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`days.${index}.market_status`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-end">
                          <div className="flex items-center space-x-2">
                            <FormLabel>Market Open</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : editingId
                      ? "Update Game"
                      : "Add Game"}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Games Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No.</TableHead>
                <TableHead>Game Name</TableHead>
                <TableHead>Today's Day</TableHead>
                <TableHead>Open Time</TableHead>
                <TableHead>Close Time</TableHead>
                <TableHead>Market Status</TableHead>
                <TableHead>Game Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow key="loading">
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : games.length === 0 ? (
                <TableRow key="no-games">
                  <TableCell colSpan={8} className="text-center">
                    No games found
                  </TableCell>
                </TableRow>
              ) : (
                games.map((game, index) => {
                  const today = getTodayDayName();
                  const todayData = game?.days?.find(
                    (d) => d?.day === today
                  );

                  return (
                    <TableRow key={game._id?.toString() || index}>
                      <TableCell>
                        {(currentPage - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {game?.game_name}
                      </TableCell>
                      <TableCell>{today}</TableCell>
                      <TableCell>
                        {formatTime(todayData?.open_time)}
                      </TableCell>
                      <TableCell>
                        {formatTime(todayData?.close_time)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            todayData?.market_status ? "default" : "secondary"
                          }
                          className={`cursor-pointer ${todayData?.market_status
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          onClick={() => openMarketStatusDialog(game)}
                        >
                          {todayData?.market_status ? "Open" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={game.is_active}
                          onCheckedChange={() =>
                            handleGameStatusToggle(
                              game._id as string,
                              game.is_active
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(game)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(game._id as string)}
                        >
                          <FiTrash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Market Status Dialog */}
        <Dialog open={marketStatusDialogOpen} onOpenChange={setMarketStatusDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Market Hours - {selectedGame?.game_name}
              </DialogTitle>
              <DialogDescription>
                Update open/close times and market status for each day
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {selectedGameDays.map((day, index) => (
                <div
                  key={`dialog-day-${day.day}-${index}`}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                >
                  <h4 className="font-medium md:col-span-4">{day.day}</h4>
                  <div>
                    <Label>Open Time</Label>
                    <Input
                      type="time"
                      value={day.open_time}
                      onChange={(e) =>
                        handleDayStatusChange(index, "open_time", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Close Time</Label>
                    <Input
                      type="time"
                      value={day.close_time}
                      onChange={(e) =>
                        handleDayStatusChange(index, "close_time", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Switch
                      checked={day.market_status}
                      onCheckedChange={(checked) =>
                        handleDayStatusChange(index, "market_status", checked)
                      }
                    />
                    <Label>Market Open</Label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeMarketStatusDialog}>
                Cancel
              </Button>
              <Button onClick={saveMarketStatusChanges}>
                Update Market Hours
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MainMarket;