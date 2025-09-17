// src/pages/admin/TracksPage.tsx
import { useEffect, useState } from "react";
import {Table, Button, Space, message, Upload, Form, Input, Modal, InputNumber} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../services/adminApi";

const TracksPage = () => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTrack, setEditingTrack] = useState<any>(null);

// Відкриття модалки для редагування
    const handleEdit = (track: any) => {
        setEditingTrack(track);
        setIsModalVisible(true);
        form.setFieldsValue({
            title: track.title,
            duration: track.duration,
            albumId: track.albumId,
            genreId: track.genreId,
            // файли не встановлюємо, їх потрібно заново вибрати
        });
    };
    const handleSave = async (values: any) => {
        try {
            const { title, duration, albumId, file, cover, genreId } = values;

            // Перетворюємо genreId і albumId на числа
            const genreIdNumber = Number(genreId);
            const albumIdNumber = Number(albumId);

            if (!genreIdNumber) {
                message.error("Всі обов'язкові поля повинні бути заповнені");
                return;
            }

            if (editingTrack) {
                // Редагування треку
                await adminApi.updateTrack(editingTrack.id, {
                    title,
                    duration,
                    albumId: albumIdNumber,
                    file: file?.[0]?.originFileObj,
                    cover: cover?.[0]?.originFileObj,
                    genreId: genreIdNumber
                });
                message.success("Трек оновлено");
            } else {
                // Створення треку
                await adminApi.createTrack(
                    title,
                    duration,
                    albumIdNumber,
                    file[0].originFileObj,
                    cover[0].originFileObj,
                    genreIdNumber
                );
                message.success("Трек створено");
            }

            // Закриваємо модалку і очищаємо форму
            setIsModalVisible(false);
            setEditingTrack(null);
            form.resetFields();
            loadTracks();
        } catch (error) {
            console.error("Failed to save track", error);
            message.error("Не вдалося зберегти трек");
        }
    };
    const loadTracks = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getTracks();
            setTracks(res.data);
        } catch {
            message.error("Не вдалося завантажити треки");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTracks();
    }, []);

    // const handleCreate = async (values: any) => {
    //     try {
    //         const { title, duration, albumId, file } = values;
    //         const realFile = file[0].originFileObj; // правильний доступ
    //
    //         await adminApi.createTrack(title, duration, albumId, realFile);
    //         message.success("Трек створено");
    //         setIsModalVisible(false);
    //         form.resetFields();
    //         loadTracks();
    //     } catch {
    //         message.error("Не вдалося створити трек");
    //     }
    // };

    const handleDelete = async (id: number) => {
        await adminApi.deleteTrack(id);
        message.success("Трек видалено");
        loadTracks();
    };

    const handleHideUnhide = async (id: number, hidden: boolean) => {
        try {
            if (hidden) {
                await adminApi.unhideTrack(id);
                message.success("Трек відновлено");
            } else {
                await adminApi.hideTrack(id);
                message.success("Трек приховано");
            }
            loadTracks();
        } catch {
            message.error("Не вдалося змінити статус треку");
        }
    };

    const handleUploadCover = async (id: number, file: File) => {
        try {
            await adminApi.uploadTrackCover(id, file);
            message.success("Обкладинку завантажено");
        } catch {
            message.error("Не вдалося завантажити обкладинку");
        }
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Title", dataIndex: "title" },
        { title: "Author", dataIndex: "author" },
        { title: "Genre", dataIndex: "genreId" },
        {
            title: "Status",
            render: (_: any, record: any) => (record.hidden ? "Hidden" : "Visible"),
        },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                    <Button onClick={() => handleHideUnhide(record.id, record.hidden)}>
                        {record.hidden ? "Unhide" : "Hide"}
                    </Button>
                    <Upload
                        showUploadList={false}
                        customRequest={({ file }) => handleUploadCover(record.id, file as File)}
                    >
                        <Button icon={<UploadOutlined />}>Upload Cover</Button>
                    </Upload>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={() => setIsModalVisible(true)}
                >
                    Create Track
                </Button>

                <Modal
                    title={editingTrack ? "Edit Track" : "Create Track"}
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingTrack(null);
                        form.resetFields();
                    }}
                    footer={null}
                >
                    <Form
                        form={form}
                        onFinish={handleSave} // універсальна функція для створення/редагування
                        layout="vertical"
                    >
                        <Form.Item
                            name="title"
                            rules={[{ required: true, message: "Введіть назву" }]}
                        >
                            <Input placeholder="Title" />
                        </Form.Item>

                        <Form.Item
                            name="duration"
                            rules={[{ required: true, message: "Вкажіть тривалість" }]}
                        >
                            <Input placeholder="00:03:25" />
                        </Form.Item>

                        <Form.Item
                            name="albumId"
                            rules={[{ required: true, message: "Вкажіть AlbumId" }]}
                        >
                            <Input type="number" placeholder="AlbumId" />
                        </Form.Item>
                        <Form.Item
                            name="genreId"
                            rules={[{ required: true, message: "Вкажіть GenreId" }]}
                        >
                            <InputNumber placeholder="GenreId" />
                        </Form.Item>
                        <Form.Item
                            name="file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={editingTrack ? [] : [{ required: true, message: "Оберіть файл" }]}
                        >
                            <Upload beforeUpload={() => false} maxCount={1}>
                                <Button icon={<UploadOutlined />}>
                                    {editingTrack ? "Оновити файл" : "Вибрати файл"}
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            name="cover"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload beforeUpload={() => false} maxCount={1}>
                                <Button icon={<UploadOutlined />}>
                                    {editingTrack ? "Оновити обкладинку" : "Вибрати обкладинку"}
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                {editingTrack ? "Зберегти" : "Створити"}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Table rowKey="id" columns={columns} dataSource={tracks} loading={loading} />
            </div>
        </>
    );
};

export default TracksPage;
