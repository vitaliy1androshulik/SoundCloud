// src/pages/admin/AdminLayout.tsx
import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

const AdminLayout = () => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu theme="dark" mode="inline">
                    <Menu.Item key="users">
                        <Link to="/admin/users">Users</Link>
                    </Menu.Item>
                    <Menu.Item key="tracks">
                        <Link to="/admin/tracks">Tracks</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Content style={{ padding: 20 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;