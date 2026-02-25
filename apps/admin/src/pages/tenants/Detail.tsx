import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Tag, message, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadTenant = async () => {
    setLoading(true);
    try {
      // TODO: 实现获取租户详情的 API
      // const response = await axios.get(`/api/v1/tenants/${id}`);
      // setTenant(response.data);
      
      // 模拟数据
      setTenant({
        id: '1',
        name: 'XX 零售企业',
        code: 'retail-cn',
        status: 'ACTIVE',
        contactInfo: {
          companyName: 'XX 零售企业',
          address: '北京市朝阳区 XX 路 XX 号',
          phone: '13800138000',
          email: 'contact@retail.com',
          legalPerson: '张三',
        },
        subscription: {
          plan: 'STANDARD',
          startDate: '2026-01-01',
          endDate: '2027-12-31',
          autoRenew: true,
        },
        quota: {
          maxStores: 50,
          maxUsers: 100,
          maxApiCallsPerDay: 100000,
          maxStorageGB: 100,
        },
        createdAt: '2026-02-25T10:00:00Z',
        updatedAt: '2026-02-25T10:00:00Z',
      });
    } catch (error) {
      message.error('加载租户详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <Card>
        <p>租户不存在</p>
        <Button onClick={() => navigate('/tenants')}>返回列表</Button>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="租户详情"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tenants')}>
              返回
            </Button>
            <Button icon={<EditOutlined />} onClick={() => message.info('编辑功能开发中')}>
              编辑
            </Button>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="租户名称">{tenant.name}</Descriptions.Item>
          <Descriptions.Item label="租户编码">{tenant.code}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={tenant.status === 'ACTIVE' ? 'green' : 'red'}>
              {tenant.status === 'ACTIVE' ? '正常' : tenant.status === 'SUSPENDED' ? '停用' : '过期'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="订阅计划">
            <Tag>{tenant.subscription.plan}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="企业名称" span={2}>
            {tenant.contactInfo.companyName}
          </Descriptions.Item>
          <Descriptions.Item label="联系地址" span={2}>
            {tenant.contactInfo.address}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">{tenant.contactInfo.legalPerson}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{tenant.contactInfo.phone}</Descriptions.Item>
          <Descriptions.Item label="联系邮箱" span={2}>
            {tenant.contactInfo.email}
          </Descriptions.Item>

          <Descriptions.Item label="订阅开始日期">
            {new Date(tenant.subscription.startDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="订阅结束日期">
            {new Date(tenant.subscription.endDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="自动续费">
            {tenant.subscription.autoRenew ? '是' : '否'}
          </Descriptions.Item>

          <Descriptions.Item label="最大门店数">{tenant.quota.maxStores}</Descriptions.Item>
          <Descriptions.Item label="最大用户数">{tenant.quota.maxUsers}</Descriptions.Item>
          <Descriptions.Item label="日 API 调用量">{tenant.quota.maxApiCallsPerDay.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="存储空间">{tenant.quota.maxStorageGB} GB</Descriptions.Item>

          <Descriptions.Item label="创建时间">
            {new Date(tenant.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(tenant.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default TenantDetail;
