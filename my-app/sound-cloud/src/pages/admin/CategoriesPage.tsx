// src/pages/admin/CategoriesPage.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message } from "antd";
import { adminApi } from "../../services/adminApi";

const CategoriesPage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getCategories();
            setCategories(res.data);
        } catch {
            message.error("Не вдалося завантажити категорії");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleDelete = async (id: number) => {
        await adminApi.deleteCategory(id);
        message.success("Категорію видалено");
        loadCategories();
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Name", dataIndex: "name" },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary">Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return <Table rowKey="id" columns={columns} dataSource={categories} loading={loading} />;
};

export default CategoriesPage;
