import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
  TeamOutlined,
  ShopOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <Card title="数据概览" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="租户总数"
              value={1}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="门店总数"
              value={0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="用户总数"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Sprint 进度"
              value={83}
              suffix="%"
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Sprint 1 完成情况">
            <div style={{ marginBottom: 16 }}>
              <p>后端任务：12/12 ✅</p>
              <Progress percent={100} status="success" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <p>前端任务：3/4 🚧</p>
              <Progress percent={75} />
            </div>
            <div>
              <p>DevOps 任务：2/2 ✅</p>
              <Progress percent={100} status="success" />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="系统状态">
            <div style={{ marginBottom: 16 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              API 服务：运行中
            </div>
            <div style={{ marginBottom: 16 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              数据库：已连接
            </div>
            <div>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              缓存服务：已连接
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="快速入口" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card hoverable onClick={() => window.location.href = '/tenants'}>
              <TeamOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <h3>租户管理</h3>
              <p>管理企业租户信息</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable>
              <ShopOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <h3>门店管理</h3>
              <p>管理门店信息（开发中）</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable>
              <DashboardOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
              <h3>数据看板</h3>
              <p>业务数据分析（开发中）</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
