"use client"

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import axios from 'axios'

interface AccountSettingsData {
  welcome_bonus: string;
  global_batting: boolean;
  min_deposit: number;
  max_deposit: number;
  min_withdrawal: number;
  max_withdrawal: number;
  min_bid_amount: number;
  max_bid_amount: number;
  withdrawal_period: "morning" | "evening";
  withdrawal_open_time: string;
  withdrawal_close_time: string;
}

// Default form values to prevent uncontrolled inputs
const defaultFormData: AccountSettingsData = {
  welcome_bonus: "",
  global_batting: false,
  min_deposit: 0,
  max_deposit: 0,
  min_withdrawal: 0,
  max_withdrawal: 0,
  min_bid_amount: 0,
  max_bid_amount: 0,
  withdrawal_period: "morning",
  withdrawal_open_time: "",
  withdrawal_close_time: ""
};

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AccountSettingsData>(defaultFormData);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch existing settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/accountsetting');
      if (response.data.status && response.data.data) {
        // Safely merge API data with defaults to ensure no undefined values
        const apiData = response.data.data;
        setFormData({
          welcome_bonus: apiData.welcome_bonus || defaultFormData.welcome_bonus,
          global_batting: apiData.global_batting !== undefined ? apiData.global_batting : defaultFormData.global_batting,
          min_deposit: apiData.min_deposit || defaultFormData.min_deposit,
          max_deposit: apiData.max_deposit || defaultFormData.max_deposit,
          min_withdrawal: apiData.min_withdrawal || defaultFormData.min_withdrawal,
          max_withdrawal: apiData.max_withdrawal || defaultFormData.max_withdrawal,
          min_bid_amount: apiData.min_bid_amount || defaultFormData.min_bid_amount,
          max_bid_amount: apiData.max_bid_amount || defaultFormData.max_bid_amount,
          withdrawal_period: apiData.withdrawal_period || defaultFormData.withdrawal_period,
          withdrawal_open_time: apiData.withdrawal_open_time || defaultFormData.withdrawal_open_time,
          withdrawal_close_time: apiData.withdrawal_close_time || defaultFormData.withdrawal_close_time,
        });
      }
      setIsDataLoaded(true);
    } catch (error) {
      if(error instanceof Error){
      toast.error(error.message || 'Failed to load account settings');
      setIsDataLoaded(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "global_batting") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "true"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/accountsetting', formData);
      
      if (response.data.status) {
        toast.success('Account settings saved successfully');
      } else {
        toast.error(response.data.message || 'Failed to save settings');
      }
    } catch (error: any) {
     if(error instanceof Error){
      toast.error(error?.message || 'Failed to save account settings');
     }
    } finally {
      setLoading(false);
    }
  };

  // Don't render form until data is loaded to prevent controlled/uncontrolled issues
  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className='font-semibold text-2xl'>Account Rules & Limits</h1>
      
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="welcome_bonus">Welcome Bonus</Label>
            <Input
              id="welcome_bonus"
              name="welcome_bonus"
              type="text"
              placeholder="Enter welcome bonus"
              value={formData.welcome_bonus}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="global_batting">Global Batting</Label>
            <Select
              value={formData.global_batting ? "true" : "false"}
              onValueChange={(value) => handleSelectChange("global_batting", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Global Batting" />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-gray-900'>
                <SelectGroup>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="min_deposit">Min Deposit</Label>
            <Input
              id="min_deposit"
              name="min_deposit"
              type="number"
              placeholder="Enter minimum deposit"
              value={formData.min_deposit || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="max_deposit">Max Deposit</Label>
            <Input
              id="max_deposit"
              name="max_deposit"
              type="number"
              placeholder="Enter maximum deposit"
              value={formData.max_deposit || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="min_withdrawal">Min Withdrawal</Label>
            <Input
              id="min_withdrawal"
              name="min_withdrawal"
              type="number"
              placeholder="Enter minimum withdrawal"
              value={formData.min_withdrawal || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="max_withdrawal">Max Withdrawal</Label>
            <Input
              id="max_withdrawal"
              name="max_withdrawal"
              type="number"
              placeholder="Enter maximum withdrawal"
              value={formData.max_withdrawal || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="min_bid_amount">Min Bid Point</Label>
            <Input
              id="min_bid_amount"
              name="min_bid_amount"
              type="number"
              placeholder="Enter minimum bid amount"
              value={formData.min_bid_amount || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="max_bid_amount">Max Bid Point</Label>
            <Input
              id="max_bid_amount"
              name="max_bid_amount"
              type="number"
              placeholder="Enter maximum bid amount"
              value={formData.max_bid_amount || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="withdrawal_period">Withdrawal Time</Label>
            <Select
              value={formData.withdrawal_period}
              onValueChange={(value) => handleSelectChange("withdrawal_period", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Withdrawal Time" />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-gray-900'>
                <SelectGroup>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="withdrawal_open_time">Withdrawal Open Time</Label>
            <Input
              id="withdrawal_open_time"
              name="withdrawal_open_time"
              type="time"
              value={formData.withdrawal_open_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="withdrawal_close_time">Withdrawal Close Time</Label>
            <Input
              id="withdrawal_close_time"
              name="withdrawal_close_time"
              type="time"
              value={formData.withdrawal_close_time}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AccountSettings