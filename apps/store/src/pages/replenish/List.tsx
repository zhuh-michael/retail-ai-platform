import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { List, Button, Tag, Empty, Loading } from 'antd-mobile';
import axios from 'axios';

interface ReplenishmentItem {
  id: string;
  skuId: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
  adjustedQuantity?: number;
  reasoning: string;
  status: 'PENDING' | 'ADJUSTED' | 'CONFIRMED';
}

interface ReplenishmentPlan {
  id: string;
  storeId: string;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED';
  generatedAt: string;
  items: ReplenishmentItem[];
}

const ReplenishList: React.FC = () => {
  const [plans, setPlans] = useState<ReplenishmentPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      // TODO: 实现 API 调用
      // const response = await axios.get('/api/v1/replenishments?storeId=xxx');
      // setPlans(response.data);
      
      // 模拟数据
      setPlans([
        {
          id: '1',
          storeId: 'store-001',
          status: 'PENDING',
          generatedAt: '2026-02-25T08:00:00Z',
          items: [
            {
              id: 'item-1',
              skuId: 'sku-001',
              productName: '真丝衬衫',
              currentStock: 5,
              suggestedQuantity: 20,
              reasoning: '预测 7 天销量 18 件，安全库存 5 件',
              status: 'PENDING',
            },
            {
              id: 'item-2',
              skuId: 'sku-002',
              productName: '休闲裤',
              currentStock: 10,
              suggestedQuantity: 15,
              reasoning: '预测 7 天销量 12 件，安全库存 8 件',
              status: 'PENDING',
            },
          ],
        },
      ]);
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const goToDetail = (planId: string) => {
    Taro.navigateTo({
      url: `/pages/replenish/detail?id=${planId}`,
    });
  };

  if (loading) {
    return <Loading content="加载中..." />;
  }

  if (plans.length === 0) {
    return (
      <Empty description="暂无补货建议" />
    );
  }

  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        补货建议
      </Text>
      
      <List>
        {plans.map((plan) => (
          <List.Item
            key={plan.id}
            onClick={() => goToDetail(plan.id)}
            prefix={
              <Tag color={plan.status === 'PENDING' ? 'warning' : 'success'}>
                {plan.status === 'PENDING' ? '待确认' : '已确认'}
              </Tag>
            }
            description={
              <View style={{ fontSize: 12, color: '#999' }}>
                {new Date(plan.generatedAt).toLocaleString()} · {plan.items.length}个商品
              </View>
            }
            arrow
          >
            <View style={{ fontSize: 16 }}>
              补货计划 #{plan.id.slice(0, 8)}
            </View>
          </List.Item>
        ))}
      </List>

      <Button
        block
        color="primary"
        size="large"
        style={{ marginTop: 24 }}
        onClick={() => Taro.showToast({ title: '刷新成功', icon: 'success' })}
      >
        刷新
      </Button>
    </View>
  );
};

export default ReplenishList;
