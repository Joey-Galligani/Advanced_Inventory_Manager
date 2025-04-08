import { useEffect, useState } from 'react';
import { Text, Card, Heading } from "@radix-ui/themes";
import { getReports } from '../api/reportService';
import Navbar from '../components/Navbar';
import './Statistics.css';
import { FaChartLine } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllInvoices } from '../api/adminService';


interface Report {
  _id: string;
  sales: number;
  revenue: number;
  averageOrderPrice: number;
  mostPurchasedProducts: Array<{
    productId: string;
    name: string;
    barCode: string;
    _id: string;
    purchaseCount: number;
  }>;
  createdAt: string;
}

interface ChartData {
  date: string;
  invoices: number;
  revenue: number;
  pendingRevenue: number;
}

interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number;
  _id: string;
}

interface Invoice {
  _id: string;
  items: InvoiceItem[];
  totalAmount: number;
  status:
  | "FAILED"
  | "REFUNDED"
  | "PENDING"
  | "PARTIALLY_REFUNDED"
  | "DECLINED"
  | "COMPLETED";
  createdAt: string;
}


const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);


  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch report data
      const reportResponse = await getReports();
      if (reportResponse?.report) {
        setReport(reportResponse.report);
      }

      // Fetch and process invoices
      const invoiceResponse = await getAllInvoices();
      const invoices = Array.isArray(invoiceResponse) ? invoiceResponse : invoiceResponse?.data;

      if (Array.isArray(invoices)) {
        const processedData = processInvoiceData(invoices);
        setChartData(processedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const processInvoiceData = (invoices: Invoice[]): ChartData[] => {
    const stats = new Map<string, ChartData>();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      stats.set(dateStr, {
        date: dateStr,
        invoices: 0,
        revenue: 0,
        pendingRevenue: 0
      });
    }

    // Process invoices
    invoices.forEach(invoice => {
      const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (stats.has(dateStr)) {
        const dayStats = stats.get(dateStr)!;
        dayStats.invoices++;
        if (invoice.status === 'COMPLETED') {
          dayStats.revenue += invoice.totalAmount;
        } else if (invoice.status === 'PENDING') {
          dayStats.pendingRevenue += invoice.totalAmount;
        }
      }
    });

    return Array.from(stats.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useEffect(() => {
    fetchData();

  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!report) return <div>No report data available</div>;

  return (
    <>
      <Navbar />
      <div className="statistics-container">
        <header className="statistics-header flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-4xl text-orange-500" />
            <Heading size="8" className="text-orange-500">Sales Report</Heading>
          </div>
          <Text size="2" className="text-gray-400">Generated on: {new Date(report.createdAt).toLocaleString()}</Text>
        </header>

        <div className="stats-grid">
          {[['Total Sales', report.sales], ['Total Revenue', `${report.revenue.toFixed(2)}€`], ['Average Order', `${report.averageOrderPrice.toFixed(2)}€`]].map(([label, value]) => (
            <Card key={label} className="stat-card">
              <Text className="stat-label">{label}</Text>
              <Text className="stat-value">{value}</Text>
            </Card>
          ))}
        </div>

        <Card className="chart-container p-6">
          <Text className="text-xl font-bold mb-4">Sales Overview</Text>
          <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            {/* Left Y-axis for revenue */}
            <YAxis 
              yAxisId="left"
              stroke="#22C55E"
              tick={{ fill: '#9CA3AF' }}
              label={{ 
                value: 'Revenue (€)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#22C55E' }
              }}
            />
            {/* Right Y-axis for invoice count */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#F97316"
              tick={{ fill: '#9CA3AF' }}
              label={{ 
                value: 'Number of Invoices', 
                angle: 90, 
                position: 'insideRight',
                style: { fill: '#F97316' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.375rem'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              name="Revenue"
              stroke="#22C55E" 
              strokeWidth={2}
              dot={{ fill: '#22C55E' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="pendingRevenue" 
              name="Pending Revenue"
              stroke="#FCD34D" 
              strokeWidth={2}
              dot={{ fill: '#FCD34D' }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="invoices" 
              name="Invoices"
              stroke="#F97316" 
              strokeWidth={2}
              dot={{ fill: '#F97316' }}
            />
          </LineChart>
          </ResponsiveContainer>
        </Card>
        </div>
        <div className="mt-8">
      <Card className="products-table overflow-hidden">
        <div className="p-6">
          <Text className="text-xl font-bold text-orange-500 mb-4">
            Most Purchased Products
          </Text>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300 bg-zinc-800">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300 bg-zinc-800">
                    Barcode
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300 bg-zinc-800">
                    Purchase Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700 bg-zinc-900">
                {report.mostPurchasedProducts.map(({ _id, name, barCode, purchaseCount }) => (
                  <tr 
                    key={_id}
                    className="hover:bg-zinc-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {barCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-300">
                          {purchaseCount}
                        </span>
                        <div 
                          className="h-2 bg-orange-500/20 rounded-full"
                          style={{
                            width: `${(purchaseCount / Math.max(...report.mostPurchasedProducts.map(p => p.purchaseCount))) * 100}px`
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};

export default Statistics;
