// src/pages/admin/TracksPage.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../services/adminApi";

const TracksPage = () => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
            await adminApi.uploadCover(id, file);
            message.success("Обкладинку завантажено");
        } catch {
            message.error("Не вдалося завантажити обкладинку");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Title", dataIndex: "title" },
        { title: "Artist", dataIndex: "artist" },
        {
            title: "Status",
            render: (_: any, record: any) => (record.hidden ? "Hidden" : "Visible"),
        },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary">Edit</Button>
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

    return <Table rowKey="id" columns={columns} dataSource={tracks} loading={loading} />;
};

export default TracksPage;