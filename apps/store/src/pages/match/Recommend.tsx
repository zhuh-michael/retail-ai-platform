import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState } from 'react';
import { Card, Button, Scanner, Toast, Swiper } from 'antd-mobile';
import axios from 'axios';

interface MatchItem {
  id: string;
  skuId: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface MatchRecommendation {
  id: string;
  score: number;
  reason: string;
  items: MatchItem[];
  totalPrice: number;
}

const MatchRecommend: React.FC = () => {
  const router = useRouter();
  const { skuId } = router.params;
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // 扫码识别商品
  const handleScan = async () => {
    setScanning(true);
    try {
      const code = await Scanner.scan();
      if (code) {
        await generateMatches(code);
      }
    } catch (error) {
      Toast.show({ content: '扫码失败', icon: 'error' });
    } finally {
      setScanning(false);
    }
  };

  // 生成搭配推荐
  const generateMatches = async (productId: string) => {
    setLoading(true);
    try {
      // TODO: 实现 API 调用
      // const response = await axios.post('/api/v1/products/matches', {
      //   tenantId: 'tenant-001',
      //   baseProductId: productId,
      // });
      // setMatches(response.data);
      
      // 模拟数据
      setMatches([
        {
          id: 'match-1',
          score: 0.95,
          reason: '同风格日常搭配',
          items: [
            { id: '1', skuId: 'sku-001', name: '真丝衬衫', price: 899, imageUrl: '/images/shirt.jpg', category: '上衣' },
            { id: '2', skuId: 'sku-002', name: '休闲西裤', price: 699, imageUrl: '/images/pants.jpg', category: '下装' },
            { id: '3', skuId: 'sku-003', name: '尖头高跟鞋', price: 799, imageUrl: '/images/shoes.jpg', category: '鞋子' },
          ],
          totalPrice: 2397,
        },
        {
          id: 'match-2',
          score: 0.9,
          reason: '商务场合搭配',
          items: [
            { id: '1', skuId: 'sku-001', name: '真丝衬衫', price: 899, imageUrl: '/images/shirt.jpg', category: '上衣' },
            { id: '4', skuId: 'sku-004', name: '铅笔裙', price: 599, imageUrl: '/images/skirt.jpg', category: '下装' },
            { id: '5', skuId: 'sku-005', name: '西装外套', price: 1299, imageUrl: '/images/blazer.jpg', category: '外套' },
          ],
          totalPrice: 2797,
        },
        {
          id: 'match-3',
          score: 0.85,
          reason: '时尚撞色搭配',
          items: [
            { id: '1', skuId: 'sku-001', name: '真丝衬衫', price: 899, imageUrl: '/images/shirt.jpg', category: '上衣' },
            { id: '6', skuId: 'sku-006', name: '阔腿裤', price: 799, imageUrl: '/images/wide-pants.jpg', category: '下装' },
            { id: '7', skuId: 'sku-007', name: '撞色围巾', price: 299, imageUrl: '/images/scarf.jpg', category: '配饰' },
          ],
          totalPrice: 1997,
        },
      ]);
    } catch (error) {
      Toast.show({ content: '生成搭配失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addToBag = (match: MatchRecommendation) => {
    Toast.show({
      content: `已添加${match.items.length}件商品到购物袋`,
      icon: 'success',
    });
  };

  if (loading) {
    return <View style={{ padding: 24, textAlign: 'center' }}>正在生成搭配...</View>;
  }

  return (
    <View style={{ padding: 12, paddingBottom: 100 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        AI 搭配推荐
      </Text>

      {!skuId && (
        <Card style={{ marginBottom: 12 }}>
          <Button
            block
            color="primary"
            size="large"
            loading={scanning}
            onClick={handleScan}
          >
            📷 扫码识别商品
          </Button>
        </Card>
      )}

      {matches.length === 0 ? (
        <Card>
          <Text style={{ textAlign: 'center', color: '#999', padding: 24 }}>
            暂无搭配推荐，请先扫描商品
          </Text>
        </Card>
      ) : (
        matches.map((match, index) => (
          <Card key={match.id} style={{ marginBottom: 12 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                搭配方案 {index + 1}
              </Text>
              <Text style={{ fontSize: 14, color: '#1890ff' }}>
                {match.reason}
              </Text>
              <Text style={{ fontSize: 12, color: '#999' }}>
                推荐度：{(match.score * 100).toFixed(0)}%
              </Text>
            </View>

            {/* 商品轮播 */}
            <Swiper style={{ height: 200, marginBottom: 12 }} loop>
              {match.items.map((item) => (
                <View key={item.id} style={{ padding: 12 }}>
                  <Image
                    src={item.imageUrl}
                    style={{ width: '100%', height: 160, borderRadius: 8 }}
                    mode="aspectFill"
                  />
                  <Text style={{ fontSize: 14, marginTop: 8 }}>{item.name}</Text>
                  <Text style={{ fontSize: 16, color: '#f5222d', fontWeight: 'bold' }}>
                    ¥{item.price}
                  </Text>
                </View>
              ))}
            </Swiper>

            {/* 商品清单 */}
            <View style={{ marginBottom: 12 }}>
              {match.items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#f5222d' }}>¥{item.price}</Text>
                </View>
              ))}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  fontWeight: 'bold',
                }}
              >
                <Text style={{ fontSize: 16 }}>总计:</Text>
                <Text style={{ fontSize: 18, color: '#f5222d' }}>¥{match.totalPrice}</Text>
              </View>
            </View>

            <Button
              block
              color="primary"
              size="large"
              onClick={() => addToBag(match)}
            >
              一键加入购物袋
            </Button>
          </Card>
        ))
      )}

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
          color="success"
          size="large"
          onClick={() => Taro.navigateBack()}
        >
          完成
        </Button>
      </View>
    </View>
  );
};

export default MatchRecommend;
