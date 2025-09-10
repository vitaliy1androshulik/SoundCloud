import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { adminApi } from "../../services/adminApi";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers();
            setUsers(res.data);
        } catch (err) {
            message.error("Не вдалося завантажити користувачів");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        try {
            await adminApi.deleteUser(id);
            message.success("Користувача видалено");
            loadUsers();
        } catch {
            message.error("Помилка при видаленні");
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Email", dataIndex: "email" },
        { title: "Username", dataIndex: "username" },
        { title: "Role", dataIndex: "role" },
        {
            title: "Дії",
            render: (_: any, record: any) => (
                <>
                    <Popconfirm
                        title="Видалити користувача?"
                        onConfirm={() => deleteUser(record.id)}
                    >
                        <Button danger>Видалити</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <Table
            rowKey="id"
            dataSource={users}
            columns={columns}
            loading={loading}
        />
    );
}
