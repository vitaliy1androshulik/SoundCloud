import React, { useEffect, useRef, useState } from "react";
import api from "../../utilities/axiosInstance";
import {SearchResponse} from "../../types/search_types.ts";

const SearchPage: React.FC = () => {
    const [q, setQ] = useState("");
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);

    const [trackPageSize] = useState(8);

    useEffect(() => {
        if (q.trim().length < 2) {
            setResults(null);
            return;
        }
        const timer = setTimeout(() => fetchResults(q, 1), 300); // debounce
        return () => clearTimeout(timer);
    }, [q]);

    const fetchResults = async (query: string, page = 1) => {
        controllerRef.current?.abort();
        controllerRef.current = new AbortController();
        try {
            setLoading(true);
            const res = await api.get<SearchResponse>("/search", {
                params: {
                    q: query,
                    trackPage: page,
                    trackPageSize
                },
                signal: controllerRef.current.signal
            });
            setResults(res.data);
        } catch (err: any) {
            if (err.name === "CanceledError" || err.name === "AbortError") return;
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    // const openAlbum = async (albumId: number) => {
    //     // можна навігувати на сторінку альбому і/або підвантажити його треки та setPlaylist
    //     // const res = await api.get(`/api/albums/${albumId}/tracks`);
    //     // setPlaylist(res.data);
    //     // playTrack(res.data[0], res.data);
    // };

    return (
        <div className="layout_container align-items-center top-[200px]">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tracks, albums, playlists..."
            />
            {loading && <div>Loading…</div>}

            {results && (
                <div>
                    <h4>Tracks</h4>
                    {results.tracks.items.length === 0 ? <div>No tracks</div> : (
                        <ul>
                            {results.tracks.items.map(t => (
                                <li key={t.id}>
                                    <img src={t.imageUrl ? `http://localhost:5122${t.imageUrl}` : "/default-cover.png"} width={48} />
                                    <div>{t.title}</div>
                                    <div>{t.author}</div>

                                </li>
                            ))}
                        </ul>
                    )}
                    <h4>Authors</h4>
                    {results.users.items.length === 0 ? <div>No tracks</div> : (
                        <ul>
                            {results.users.items.map(t => (
                                <li key={t.id}>
                                    <div>{t.username}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {/*<h4>Albums</h4>*/}
                    {/*{results.albums.items.map(a => (*/}
                    {/*    <div key={a.id} onClick={() => openAlbum(a.id)}>*/}
                    {/*        <img src={a.imageUrl ? `http://localhost:5122${a.imageUrl}` : "/default-cover.png"} width={48} />*/}
                    {/*        <div>{a.title} — {a.artist}</div>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                    {/*<h4>Playlists</h4>*/}
                    {/*{results.playlists.items.map(p => (*/}
                    {/*    <div key={p.id} onClick={() => /!* open playlist *!/}>*/}
                    {/*        <img src={p.imageUrl ? `http://localhost:5122${p.imageUrl}` : "/default-cover.png"} width={48} />*/}
                    {/*        <div>{p.name} — {p.owner}</div>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>
            )}
        </div>
    );
};
export default SearchPage;