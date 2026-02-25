import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Tenant {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  contactInfo: {
    companyName: string;
    email: string;
    phone: string;
  };
  subscription: {
    plan: 'BASIC' | 'STANDARD' | 'ENTERPRISE';
    endDate: string;
  };
  createdAt: string;
}

const TenantList: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 加载租户列表
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      // TODO: 实现获取租户列表的 API
      // const response = await axios.get('/api/v1/tenants');
      // setTenants(response.data);
      
      // 模拟数据
      setTenants([
        {
          id: '1',
          name: 'XX 零售企业',
          code: 'retail-cn',
          status: 'ACTIVE',
          contactInfo: {
            companyName: 'XX 零售企业',
            email: 'contact@retail.com',
            phone: '13800138000',
          },
          subscription: {
            plan: 'STANDARD',
            endDate: '2027-12-31',
          },
          createdAt: '2026-02-25T10:00:00Z',
        },
      ]);
    } catch (error) {
      message.error('加载租户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建租户
  const handleCreate = async (values: any) => {
    try {
      await axios.post('/api/v1/tenants', values);
      message.success('创建成功');
      setIsModalVisible(false);
      form.resetFields();
      loadTenants();
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建失败');
    }
  };

  // 删除租户
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该租户吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await axios.delete(`/api/v1/tenants/${id}`);
          message.success('删除成功');
          loadTenants();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '租户名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '租户编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '企业',
      dataIndex: ['contactInfo', 'companyName'],
      key: 'companyName',
    },
    {
      title: '订阅计划',
      dataIndex: ['subscription', 'plan'],
      key: 'plan',
      render: (plan: string) => {
        const colors: Record<string, string> = {
          BASIC: 'blue',
          STANDARD: 'green',
          ENTERPRISE: 'purple',
        };
        return <Tag color={colors[plan]}>{plan}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          ACTIVE: 'green',
          SUSPENDED: 'red',
          EXPIRED: 'gray',
        };
        return <Tag color={colors[status]}>
          {status === 'ACTIVE' ? '正常' : status === 'SUSPENDED' ? '停用' : '过期'}
        </Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Tenant) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tenants/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => message.info('编辑功能开发中')}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="租户管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            创建租户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tenants}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* 创建租户弹窗 */}
      <Modal
        title="创建租户"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="租户名称"
            rules={[{ required: true, message: '请输入租户名称' }]}
          >
            <Input placeholder="例如：XX 零售企业" />
          </Form.Item>

          <Form.Item
            name="code"
            label="租户编码"
            rules={[
              { required: true, message: '请输入租户编码' },
              { min: 2, message: '编码至少 2 个字符' },
            ]}
          >
            <Input placeholder="例如：retail-cn" />
          </Form.Item>

          <Form.Item
            name="plan"
            label="订阅计划"
            rules={[{ required: true }]}
            initialValue="BASIC"
          >
            <Select>
              <Select.Option value="BASIC">基础版</Select.Option>
              <Select.Option value="STANDARD">标准版</Select.Option>
              <Select.Option value="ENTERPRISE">企业版</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantList;
