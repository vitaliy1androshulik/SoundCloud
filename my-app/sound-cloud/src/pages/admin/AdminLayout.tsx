// src/pages/admin/AdminLayout.tsx
import { Layout, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Sider, Content } = Layout;

const AdminLayout = () => {
    const location = useLocation();
    const selectedKey = location.pathname.split("/")[2]; // виділяє активну вкладку

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                >
                    <Menu.Item key="users">
                        <Link to="/admin/users">Users</Link>
                    </Menu.Item>
                    <Menu.Item key="tracks">
                        <Link to="/admin/tracks">Tracks</Link>
                    </Menu.Item>
                    <Menu.Item key="albums">
                        <Link to="/admin/albums">Albums</Link>
                    </Menu.Item>
                    <Menu.Item key="categories">
                        <Link to="/admin/categories">Categories</Link>
                    </Menu.Item>
                    <Menu.Item key="playlists">
                        <Link to="/admin/playlists">Playlists</Link>
                    </Menu.Item>
                    <Menu.Item key="admin">
                        <Link to="/admin/admin">Admin</Link>
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
