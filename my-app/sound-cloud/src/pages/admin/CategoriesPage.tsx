import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../services/adminApi";

const CategoriesPage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [form] = Form.useForm();

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

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const file = values.imageFile?.fileList?.[0]?.originFileObj;

            if (editingCategory) {
                await adminApi.updateCategory(editingCategory.id, {
                    name: values.name,
                    slug: values.slug,
                    imageFile: file,
                });
                message.success("Категорію оновлено");
            } else {
                await adminApi.createCategory({
                    name: values.name,
                    slug: values.slug,
                    imageFile: file,
                });
                message.success("Категорію створено");
            }

            setIsModalVisible(false);
            form.resetFields();
            setEditingCategory(null);
            loadCategories();
        } catch (err) {
            message.error("Помилка при збереженні категорії");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await adminApi.deleteCategory(id);
            message.success("Категорію видалено");
            loadCategories();
        } catch {
            message.error("Не вдалося видалити категорію");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Name", dataIndex: "name" },
        { title: "Slug", dataIndex: "slug" },
        {
            title: "Image",
            dataIndex: "imageUrl",
            render: (url: string) => url ? <img src={url} alt="cover" width={50} /> : "—",
        },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditingCategory(record);
                            form.setFieldsValue({
                                name: record.name,
                                slug: record.slug,
                            });
                            setIsModalVisible(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button
                type="primary"
                style={{ marginBottom: 16 }}
                onClick={() => {
                    setEditingCategory(null);
                    form.resetFields();
                    setIsModalVisible(true);
                }}
            >
                Додати категорію
            </Button>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={categories}
                loading={loading}
            />

            <Modal
                title={editingCategory ? "Редагувати категорію" : "Створити категорію"}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: "Введіть назву" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "Введіть slug" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="imageFile" label="Image">
                        <Upload beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Завантажити</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CategoriesPage;
