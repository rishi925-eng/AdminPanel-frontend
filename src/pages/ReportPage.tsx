import React, { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Select, Button, Space, Row, Col } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import './styles/pages/ReportPage.css';
const { RangePicker } = DatePicker;
const { Option } = Select;

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
   const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [category, setCategory] = useState<string>('all');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // API call to fetch report data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData: ReportData[] = [
        { id: '1', date: '2025-09-15', category: 'Complaints', value: 25, status: 'Resolved' },
        { id: '2', date: '2025-09-14', category: 'Permits', value: 15, status: 'Pending' },
        // Add more mock data as needed
      ];
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const chartConfig = {
    data: reportData,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    legend: {
      position: 'top',
    },
    smooth: true,
  };

  return (
    <div className="reports-page">
      <Card title="Reports Dashboard">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <RangePicker
                onChange={(dates) => setDateRange(dates as [Date, Date])}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <Select
                defaultValue="all"
                style={{ width: '100%' }}
                onChange={setCategory}
              >
                <Option value="all">All Categories</Option>
                <Option value="complaints">Complaints</Option>
                <Option value="permits">Permits</Option>
                <Option value="services">Services</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchReportData}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Space>
            </Col>
          </Row>

          <Card title="Analytics Overview">
            <Line {...chartConfig} />
          </Card>

          <Table
            columns={columns}
            dataSource={reportData}
            loading={loading}
            rowKey="id"
            pagination={{
              total: reportData.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ReportsPage;