import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Select } from "antd";
import { adminApi } from "../../services/adminApi";

const { Option } = Select;

const UsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState<any>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers();
            setUsers(res.data);
        } catch {
            message.error("Не вдалося завантажити користувачів");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id: number) => {
        await adminApi.deleteUser(id);
        message.success("Користувача видалено");
        loadUsers();
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            role: user.role,
        });
        setModalVisible(true);
    };

    const handleCreateOrUpdate = async () => {
        try {
            const values = await form.validateFields();

            if (editingUser) {

                const { password, confirmPassword, ...updateData } = values;
                await adminApi.updateUser(editingUser.id, updateData);
                message.success("Користувача оновлено");
            } else {
                // При створенні користувача обов'язково password і confirmPassword
                if (values.password !== values.confirmPassword) {
                    message.error("Паролі не співпадають");
                    return;
                }
                await adminApi.createUser(values);
                message.success("Користувача створено");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            message.error("Не вдалося виконати операцію");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Email", dataIndex: "email" },
        { title: "Username", dataIndex: "username" },
        { title: "Role", dataIndex: "role" },
        {
            title: "Дії",
            render: (_: any, record: any) => (
                <Space>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
                Додати користувача
            </Button>

            <Table rowKey="id" columns={columns} dataSource={users} loading={loading} />

            <Modal
                title={editingUser ? "Редагувати користувача" : "Додати користувача"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingUser(null);
                }}
                onOk={handleCreateOrUpdate}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "Введіть username" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Введіть email" }]}
                    >
                        <Input />
                    </Form.Item>

                    {!editingUser && (
                        <>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: "Введіть пароль" }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                rules={[{ required: true, message: "Підтвердіть пароль" }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </>
                    )}


                </Form>
            </Modal>
        </>
    );
};

export default UsersPage;
