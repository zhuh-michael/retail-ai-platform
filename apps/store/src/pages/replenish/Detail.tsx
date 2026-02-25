import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Card, Button, Stepper, Input, Toast } from 'antd-mobile';
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

const ReplenishDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;
  const [plan, setPlan] = useState<{ id: string; items: ReplenishmentItem[] } | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      // TODO: 实现 API 调用
      // const response = await axios.get(`/api/v1/replenishments/${id}`);
      // setPlan(response.data);
      
      // 模拟数据
      setPlan({
        id: '1',
        items: [
          {
            id: 'item-1',
            skuId: 'sku-001',
            productName: '真丝衬衫',
            currentStock: 5,
            suggestedQuantity: 20,
            reasoning: '预测 7 天销量 18 件，安全库存 5 件，下周末有大促',
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
      });
    } catch (error) {
      Toast.show({ content: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = (itemId: string, quantity: number) => {
    setAdjustments({
      ...adjustments,
      [itemId]: quantity,
    });
  };

  const handleReasonChange = (itemId: string, reason: string) => {
    setReasons({
      ...reasons,
      [itemId]: reason,
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // TODO: 实现确认 API
      // await axios.post(`/api/v1/replenishments/${id}/confirm`, {
      //   items: plan?.items.map(item => ({
      //     itemId: item.id,
      //     quantity: adjustments[item.id] ?? item.suggestedQuantity,
      //   })),
      // });
      
      Toast.show({ content: '确认成功', icon: 'success' });
      
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      Toast.show({ content: '确认失败', icon: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  if (loading || !plan) {
    return <View style={{ padding: 24, textAlign: 'center' }}>加载中...</View>;
  }

  return (
    <View style={{ padding: 12, paddingBottom: 100 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        补货详情
      </Text>

      {plan.items.map((item) => {
        const adjustedQty = adjustments[item.id] || item.suggestedQuantity;
        const adjustmentRate = Math.abs(adjustedQty - item.suggestedQuantity) / item.suggestedQuantity;
        const needsReason = adjustmentRate > 0.5;

        return (
          <Card key={item.id} style={{ marginBottom: 12 }}>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.productName}</Text>
              <Text style={{ fontSize: 12, color: '#999' }}>SKU: {item.skuId}</Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14 }}>当前库存：{item.currentStock}件</Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#1890ff' }}>
                建议补货：{item.suggestedQuantity}件
              </Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>
                理由：{item.reasoning}
              </Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14 }}>调整补货量：</Text>
              <Stepper
                value={adjustedQty}
                min={0}
                max={1000}
                onChange={(value) => handleAdjust(item.id, value)}
                style={{ marginTop: 8 }}
              />
            </View>

            {needsReason && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#ff4d4f' }}>
                  调整幅度超过 50%，请填写原因：
                </Text>
                <Input
                  placeholder="例如：下周有社区活动"
                  value={reasons[item.id] || ''}
                  onChange={(value) => handleReasonChange(item.id, value)}
                  style={{ marginTop: 4 }}
                />
              </View>
            )}
          </Card>
        );
      })}

      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        background: 'white',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
      }}>
        <Button
          block
          color="primary"
          size="large"
          loading={confirming}
          onClick={handleConfirm}
        >
          确认下单
        </Button>
      </View>
    </View>
  );
};

export default ReplenishDetail;
