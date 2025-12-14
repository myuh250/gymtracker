import React from 'react';
import { Layout, Menu, Avatar, Typography } from 'antd';
import { 
    ThunderboltOutlined, ScheduleOutlined, UserOutlined, LogoutOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { Text, Title } = Typography;

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { key: '/exercises', icon: <ThunderboltOutlined />, label: 'Bài tập' },
    { key: '/routines', icon: <ScheduleOutlined />, label: 'Tập Luyện' },
    { key: '/profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
  ];

  // highlight khi chọn
  const activeKey = location.pathname === '/' ? '/exercises' : location.pathname;

  return (
    <Sider 
      width={260}
      theme="light" 
      style={{ 
        borderRight: '1px solid #f0f0f0', 
        height: '100vh',     
        position: 'sticky',  
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
        {/* Logo */}
        <div style={{ 
            height: 90, 
            display: 'flex', 
            alignItems: 'center', 
            paddingLeft: 28, 
            gap: 12
        }}>
           <ThunderboltOutlined style={{fontSize: 32, color:'#000'}}/> 
           <Title level={3} style={{ margin: 0, letterSpacing: 1, fontWeight: 800 }}>GYM PRO</Title>
        </div>
        
        {/* Menulist */}
        <Menu 
            theme="light" 
            mode="inline" 
            selectedKeys={[activeKey]} 
            items={menuItems}
            onClick={(e) => navigate(e.key)} 
            style={{ 
                borderRight: 0, 
                fontSize: 16, 
                padding: '0 16px',
                fontWeight: 500 
            }} 
        />
        
        {/* User info */}
        <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            padding: '24px', 
            width: '100%', 
            borderTop: '1px solid #f0f0f0' 
        }}>
           <div 
             onClick={handleLogout} 
             style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                gap: 15, 
                alignItems: 'center',
                color: '#595959',
                padding: '8px',
                borderRadius: 8,
                transition: 'all 0.3s'
             }}
             // Hover
             onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
           >
              <Avatar size="large" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" icon={<UserOutlined />} />
              
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Text strong style={{ fontSize: 15 }}>{user?.fullName || 'User'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đăng xuất</Text>
              </div>

              <LogoutOutlined style={{ fontSize: 18 }} />
           </div>
        </div>
    </Sider>
  );
}