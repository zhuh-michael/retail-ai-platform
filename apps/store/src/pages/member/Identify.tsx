import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState } from 'react';
import { Card, Button, Input, Toast, Scanner } from 'antd-mobile';
import axios from 'axios';

const MemberIdentify: React.FC = () => {
  const router = useRouter();
  const [memberCode, setMemberCode] = useState('');
  const [phone, setPhone] = useState('');
  const [scanning, setScanning] = useState(false);

  // 扫码识别
  const handleScan = async () => {
    setScanning(true);
    try {
      const code = await Scanner.scan();
      if (code) {
        setMemberCode(code);
        await identifyMember(code, undefined);
      }
    } catch (error) {
      Toast.show({ content: '扫码失败', icon: 'error' });
    } finally {
      setScanning(false);
    }
  };

  // 手动输入识别
  const handleIdentify = async () => {
    if (!memberCode && !phone) {
      Toast.show({ content: '请输入会员码或手机号', icon: 'error' });
      return;
    }
    await identifyMember(memberCode, phone);
  };

  // 识别会员
  const identifyMember = async (code?: string, phoneNum?: string) => {
    try {
      // TODO: 实现 API 调用
      // const response = await axios.post('/api/v1/members/identify', {
      //   tenantId: 'tenant-001',
      //   memberCode: code,
      //   phone: phoneNum,
      // });
      
      // 模拟数据
      const member = {
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
        lastVisitAt: '2026-02-20',
      };

      // 记录到店
      // await axios.post(`/api/v1/members/${member.id}/visit`);

      // 跳转到画像页面
      Taro.navigateTo({
        url: `/pages/member/profile?id=${member.id}`,
      });
    } catch (error) {
      Toast.show({ content: '识别失败，会员不存在', icon: 'error' });
    }
  };

  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        会员识别
      </Text>

      <Card style={{ marginBottom: 12 }}>
        <Button
          block
          color="primary"
          size="large"
          loading={scanning}
          onClick={handleScan}
          style={{ marginBottom: 16 }}
        >
          📷 扫码识别
        </Button>

        <View style={{ textAlign: 'center', color: '#999', marginBottom: 16 }}>
          或手动输入
        </View>

        <Input
          placeholder="会员码"
          value={memberCode}
          onChange={(val) => setMemberCode(val)}
          style={{ marginBottom: 12 }}
          clearable
        />

        <Input
          placeholder="手机号"
          value={phone}
          onChange={(val) => setPhone(val)}
          type="tel"
          style={{ marginBottom: 16 }}
          clearable
        />

        <Button block color="primary" size="large" onClick={handleIdentify}>
          识别会员
        </Button>
      </Card>

      <Card>
        <Text style={{ fontSize: 14, color: '#666' }}>
          💡 提示：支持会员码扫码、手机号识别
        </Text>
      </Card>
    </View>
  );
};

export default MemberIdentify;
