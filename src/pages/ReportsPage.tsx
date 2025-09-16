// import React, { useState, useEffect } from 'react';
// import { Card, Table, DatePicker, Select, Button, Space, Row, Col } from 'antd';
// import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
// import { Line } from '@ant-design/plots';

// const { RangePicker } = DatePicker;
// const { Option } = Select;

// interface ReportData {
//   id: string;
//   date: string;
//   category: string;
//   value: number;
//   status: string;
// }

// const ReportsPage: React.FC = () => {
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState<ReportData[]>([]);
//   //  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
//   // const [category, setCategory] = useState<string>('all');

//   const fetchReportData = async () => {
//     setLoading(true);
//     try {
//       // API call to fetch report data
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       const mockData: ReportData[] = [
//         { id: '1', date: '2025-09-15', category: 'Complaints', value: 25, status: 'Resolved' },
//         { id: '2', date: '2025-09-14', category: 'Permits', value: 15, status: 'Pending' },
//         // Add more mock data as needed
//       ];
//       setReportData(mockData);
//     } catch (error) {
//       console.error('Failed to fetch report data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReportData();
//   }, []);

//   const columns = [
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//     },
//     {
//       title: 'Category',
//       dataIndex: 'category',
//       key: 'category',
//     },
//     {
//       title: 'Value',
//       dataIndex: 'value',
//       key: 'value',
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//     },
//   ];

//   const chartConfig = {
//     data: reportData,
//     xField: 'date',
//     yField: 'value',
//     seriesField: 'category',
//     legend: {
//       position: 'top',
//     },
//     smooth: true,
//   };

//   return (
//     <div className="reports-page">
//       <Card title="Reports Dashboard">
//         <Space direction="vertical" size="large" style={{ width: '100%' }}>
//           <Row gutter={16}>
//             <Col span={8}>
//               <RangePicker
//                 // onChange={(dates) => setDateRange(dates as [Date, Date])}
//                 style={{ width: '100%' }}
//               />
//             </Col>
//             <Col span={8}>
//               <Select
//                 defaultValue="all"
//                 style={{ width: '100%' }}
//                 // onChange={setCategory}
//               >
//                 <Option value="all">All Categories</Option>
//                 <Option value="complaints">Complaints</Option>
//                 <Option value="permits">Permits</Option>
//                 <Option value="services">Services</Option>
//               </Select>
//             </Col>
//             <Col span={8}>
//               <Space>
//                 <Button
//                   type="primary"
//                   icon={<ReloadOutlined />}
//                   onClick={fetchReportData}
//                   loading={loading}
//                 >
//                   Refresh
//                 </Button>
//                 <Button icon={<DownloadOutlined />}>Export</Button>
//               </Space>
//             </Col>
//           </Row>

//           <Card title="Analytics Overview">
//             <Line {...chartConfig} />
//           </Card>

//           <Table
//             columns={columns}
//             dataSource={reportData}
//             loading={loading}
//             rowKey="id"
//             pagination={{
//               total: reportData.length,
//               pageSize: 10,
//               showSizeChanger: true,
//               showTotal: (total) => `Total ${total} items`,
//             }}
//           />
//         </Space>
//       </Card>
//     </div>
//   );
// };

// export default ReportsPage;
import React, { useState, useEffect } from "react";
import { Line } from "@ant-design/plots";

// Data interface
interface ReportData {
  id: string;
  date: string;
  category: string;
  value: number;
  status: string;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // Simulated API call
  const fetchReportData = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData: ReportData[] = [
        { id: "1", date: "2025-09-15", category: "Complaints", value: 25, status: "Resolved" },
        { id: "2", date: "2025-09-14", category: "Permits", value: 15, status: "Pending" },
        { id: "3", date: "2025-09-13", category: "Services", value: 30, status: "In Progress" },
        { id: "4", date: "2025-09-12", category: "Complaints", value: 10, status: "Resolved" },
        { id: "5", date: "2025-09-11", category: "Permits", value: 18, status: "Pending" },
      ];
      setReportData(mockData);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Table columns
  const columns = ["Date", "Category", "Value", "Status"];

  // Chart config
  const chartConfig = {
    data: reportData,
    xField: "date",
    yField: "value",
    seriesField: "category",
    legend: { position: "top" },
    smooth: true,
    height: 300,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Reports Dashboard</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Date Range */}
          <input
            type="date"
            onChange={(e) =>
              setDateRange([e.target.value, dateRange ? dateRange[1] : ""])
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            onChange={(e) =>
              setDateRange([dateRange ? dateRange[0] : "", e.target.value])
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Category Select */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Complaints">Complaints</option>
            <option value="Permits">Permits</option>
            <option value="Services">Services</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            ) : (
              <span>🔄</span>
            )}
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>

          <button
            onClick={() => alert("Exporting data...")}
            className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            📥 <span>Export</span>
          </button>
        </div>

        {/* Chart Section */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Analytics Overview</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12"></div>
            </div>
          ) : (
            <Line {...chartConfig} />
          )}
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-gray-700 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-t">{row.date}</td>
                    <td className="px-4 py-2 border-t">{row.category}</td>
                    <td className="px-4 py-2 border-t">{row.value}</td>
                    <td
                      className={`px-4 py-2 border-t font-medium ${
                        row.status === "Resolved"
                          ? "text-green-600"
                          : row.status === "Pending"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
