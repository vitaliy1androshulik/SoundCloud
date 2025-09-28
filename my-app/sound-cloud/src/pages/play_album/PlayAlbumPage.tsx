import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { albumService } from "../../services/albumAPI.ts";
import { IAlbum } from "../../types/album.ts";

const AlbumPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [album, setAlbum] = useState<IAlbum | null>(null);

    useEffect(() => {
        if (!id) return;
        albumService.getAlbumById(id)
            .then(setAlbum)
            .catch(console.error);
    }, [id]);

    if (!album) return <p>Loading...</p>;

    return (
        <div className="album_page_container">
            <h1>{album.title}</h1>
            <img src={`http://localhost:5122/${album.coverUrl}`} alt={album.title} />
            <p>Author: {album.ownerName}</p>
            <div>
                {album.tracks?.map((t) => (
                    <div key={t.id}>{t.title} - {t.author}</div>
                ))}
            </div>
        </div>
    );
};

export default AlbumPage;