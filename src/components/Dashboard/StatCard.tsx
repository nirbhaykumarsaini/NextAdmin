import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";





interface StatCardProps {
  title: string;
  link: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  negative?: boolean;
}

function StatCard({ title, value, change, link, icon, negative = false }: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-end">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <p className={`text-xs mt-1 flex items-center ${negative ? 'text-red-500' : 'text-green-500'}`}>
            {change}
            {/* {negative ? (
              <FiArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <FiArrowUp className="h-3 w-3 ml-1" />
            )} */}
          </p>
        </div>
        <Link href={link}>
          <FiArrowRight className="h-5 w-5 ml-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
        </Link>
      </CardContent>
    </Card>
  );
}


export default StatCard