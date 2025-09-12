// src/pages/admin/PlaylistsPage.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../services/adminApi";

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPlaylists();
            setPlaylists(res.data);
        } catch {
            message.error("Не вдалося завантажити плейлисти");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPlaylists();
    }, []);

    const handleDelete = async (id: number) => {
        await adminApi.deletePlaylist(id);
        message.success("Плейлист видалено");
        loadPlaylists();
    };

    const handleUploadCover = async (id: number, file: File) => {
        try {
            await adminApi.uploadPlaylistCover(id, file);
            message.success("Обкладинку завантажено");
        } catch {
            message.error("Не вдалося завантажити обкладинку");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Title", dataIndex: "title" },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary">Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
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

    return <Table rowKey="id" columns={columns} dataSource={playlists} loading={loading} />;
};

export default PlaylistsPage;
