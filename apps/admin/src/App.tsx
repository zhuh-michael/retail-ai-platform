import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './pages/Login';
import TenantList from './pages/tenants/List';
import TenantDetail from './pages/tenants/Detail';
import Dashboard from './pages/Dashboard';

const { Content } = Layout;

// 简单的布局组件
const BasicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ background: '#001529', padding: '0 24px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '20px' }}>
          🦞 RetailAI Copilot
        </h1>
      </Layout.Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {children}
      </Content>
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 */}
        <Route path="/login" element={<Login />} />
        
        {/* 需要认证的路由 */}
        <Route
          path="/"
          element={
            <BasicLayout>
              <Dashboard />
            </BasicLayout>
          }
        />
        <Route
          path="/tenants"
          element={
            <BasicLayout>
              <TenantList />
            </BasicLayout>
          }
        />
        <Route
          path="/tenants/:id"
          element={
            <BasicLayout>
              <TenantDetail />
            </BasicLayout>
          }
        />
        
        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
