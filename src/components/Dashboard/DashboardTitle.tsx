import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FiLogOut, FiRefreshCw } from "react-icons/fi";
import { AppDispatch } from "@/redux/store/store";
import { logoutUser } from "@/redux/slices/authSlice";



interface DashboardTitleProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  fetchDashboardData: () => void;
  dispatch:AppDispatch; // optional if you're using Redux
}

const DashboardTitle = ({timeRange, setTimeRange, fetchDashboardData, dispatch} : DashboardTitleProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, Admin!
          </h2>
          <p className="text-muted-foreground">
            Here&lsquo;s what&lsquo;s happening with your platform today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDashboardData}>
            <FiRefreshCw className="h-4 w-4 mr-2" />
            {/* Refresh */}
          </Button>
          <Button variant="outline" onClick={() => dispatch(logoutUser())}>
            <FiLogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
  )
}

export default DashboardTitle