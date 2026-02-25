import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Card, Tag, Button, Toast } from 'antd-mobile';
import axios from 'axios';

interface MemberProfile {
  member: {
    id: string;
    name: string;
    level: string;
    points: number;
    phone: string;
    birthday: string;
    stylePreferences: {
      styles: string[];
      colors: string[];
      sizes: {
        top?: string;
        bottom?: string;
        shoes?: string;
      };
    };
    totalPurchases: number;
    visitCount: number;
  };
  talkSuggestions: string[];
  isBirthday: boolean;
}

const MemberProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // TODO: 实现 API 调用
      // const response = await axios.get(`/api/v1/members/${id}/profile`);
      // setProfile(response.data);
      
      // 模拟数据
      setProfile({
        member: {
          id: 'member-001',
          name: '王小姐',
          level: 'GOLD',
          points: 2580,
          phone: '138****8888',
          birthday: '1990-03-15',
          stylePreferences: {
            styles: ['ELEGANT', 'BUSINESS'],
            colors: ['黑色', '白色', '藏青'],
            sizes: { top: 'M', bottom: 'L', shoes: '37' },
          },
          totalPurchases: 15800,
          visitCount: 28,
        },
        talkSuggestions: [
          '王小姐，生日快乐！我们为您准备了生日专属优惠。',
          '您偏好的优雅、商务风格，最近到了不少新品，我给您介绍一下？',
          '感谢您一直以来的支持，您是我们的 GOLD 会员了。',
        ],
        isBirthday: true,
      });
    } catch (error) {
      Toast.show({ content: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <View style={{ padding: 24, textAlign: 'center' }}>加载中...</View>;
  }

  const levelColors: Record<string, string> = {
    NORMAL: 'default',
    SILVER: 'success',
    GOLD: 'warning',
    PLATINUM: 'error',
  };

  return (
    <View style={{ padding: 12, paddingBottom: 100 }}>
      {/* 基本信息 */}
      <Card style={{ marginBottom: 12 }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{profile.member.name}</Text>
          <Tag color={levelColors[profile.member.level]}>{profile.member.level}</Tag>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>
            积分：{profile.member.points}
          </Text>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>
            手机：{profile.member.phone}
          </Text>
        </View>
        
        {profile.isBirthday && (
          <View style={{ padding: 8, background: '#fff7e6', borderRadius: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#fa8c16' }}>
              🎂 今日生日
            </Text>
          </View>
        )}
      </Card>

      {/* 偏好信息 */}
      <Card style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
          偏好信息
        </Text>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#999' }}>风格偏好</Text>
          <View style={{ marginTop: 4 }}>
            {profile.member.stylePreferences.styles.map((style, index) => (
              <Tag key={index} style={{ marginRight: 8 }}>{style}</Tag>
            ))}
          </View>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#999' }}>颜色偏好</Text>
          <View style={{ marginTop: 4 }}>
            {profile.member.stylePreferences.colors.map((color, index) => (
              <Tag key={index} color="default" style={{ marginRight: 8 }}>{color}</Tag>
            ))}
          </View>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#999' }}>尺码信息</Text>
          <View style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 14 }}>
              上衣：{profile.member.stylePreferences.sizes.top} | 
              下装：{profile.member.stylePreferences.sizes.bottom} | 
              鞋子：{profile.member.stylePreferences.sizes.shoes}
            </Text>
          </View>
        </View>
      </Card>

      {/* 购买历史 */}
      <Card style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
          购买历史
        </Text>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#999' }}>累计消费</Text>
          <Text style={{ fontSize: 18, color: '#f5222d', fontWeight: 'bold' }}>
            ¥{profile.member.totalPurchases.toLocaleString()}
          </Text>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#999' }}>到店次数</Text>
          <Text style={{ fontSize: 14 }}>{profile.member.visitCount}次</Text>
        </View>
      </Card>

      {/* 推荐话术 */}
      <Card style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
          💬 推荐话术
        </Text>
        
        {profile.talkSuggestions.map((talk, index) => (
          <View
            key={index}
            style={{
              padding: 8,
              background: '#f0f2f5',
              borderRadius: 4,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14 }}>{talk}</Text>
          </View>
        ))}
      </Card>

      {/* 操作按钮 */}
      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        background: 'white',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: 8,
      }}>
        <Button
          block
          color="primary"
          size="large"
          onClick={() => Taro.navigateTo({ url: '/pages/replenish/list' })}
        >
          查看推荐商品
        </Button>
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

export default MemberProfile;
