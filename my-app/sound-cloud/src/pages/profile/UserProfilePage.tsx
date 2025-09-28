import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { userService } from "../../services/userApi.ts";
import { IUser } from "../../types/user.ts";
import {followService} from "../../services/followApi.ts";
import {IUserFollow} from "../../types/follow.ts";
import {ITrack} from "../../types/track.ts";
import {trackService} from "../../services/trackApi.ts";

const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        userService.getById(Number(id))
            .then((data) => setUser(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const [tracks, setTracks] = useState<ITrack[]>([]);

    useEffect(() => {
        if (!user) return;

        trackService.getAllByUser(Number(user.id))
            .then(setTracks)
            .catch(err => console.error("Помилка при завантаженні треків користувача:", err));
    }, [user]);



    //для follow
    // Кількість підписників і підписок
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);

    const [followingUsers, setFollowingUsers] = useState<IUserFollow[]>([]);


    useEffect(() => {
        const fetchFollowCounts = async () => {
            if (!user) return; // перевірка тут, а не для самого хука
            try {
                const followers = await followService.getFollowersCount(user.id);
                const following = await followService.getFollowingCount(user.id);

                setFollowersCount(followers);
                setFollowingCount(following);

                console.log("Followers:", followers, "Following:", following);
            } catch (error) {
                console.error("Помилка при отриманні кількості підписок:", error);
            }
        };

        fetchFollowCounts();
    }, [user]);

    useEffect(() => {
        const fetchFollowingUsers = async () => {
            if (!user) return; // так само
            try {
                const usersFromApi = await followService.getFollowing(user.id);

                setFollowingUsers(
                    usersFromApi.map(u => ({
                        id: u.id,
                        username: u.username,
                        avatarUrl: u.avatarUrl,
                        isFollowing: true,
                    }))
                );
            } catch (error) {
                console.error("Помилка при отриманні списку Following:", error);
            }
        };

        fetchFollowingUsers();
    }, [user]);








    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    const getUserBannerUrl = (user?: IUser | null) => {
        if (!user || !user.banner) return "/src/images/profile/banner.png"; // дефолтний банер
        return user.banner.startsWith("http")
            ? user.banner
            : `http://localhost:5122${user.banner}`;
    };

    const getUserImageUrl = (user?: IUser | null) => {
        if (!user || !user.avatar) return "/default-cover.png";
        console.log(user)
        return `http://localhost:5122/${user.avatar}`;
    };



// 3️⃣ Функція toggleFollow для кнопки
    const toggleFollow = async (userId: number) => {
        try {
            const userToToggle = followingUsers.find(u => u.id === userId);
            if (!userToToggle) return;

            if (userToToggle.isFollowing) {
                await followService.unfollow(userId);
            } else {
                await followService.follow(userId);
            }

            // оновлюємо локально стан
            setFollowingUsers(prev =>
                prev.map(u =>
                    u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
                )
            );
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };


    return (
        <div className="layout_container mb-[2900px] baloo2">
            <div className="banner_container">
                <img className="banner_image_style" src={getUserBannerUrl(user)} alt="Banner"/>
            </div>
            <div className="profile_page_user_avatar_container" >
                <img className="profile_page_user_avatar_style " src={getUserImageUrl(user)} alt="Avatar"/>
            </div>
            <div className="profile_page_user_name_container">
                {user?.username}
            </div>


            <div className="profile_page_following_tracks_info_container">
                <div className="followers_container">
                    <div className="title">
                        Followers
                    </div>
                    <div className="number">
                        <span>{followersCount}</span>
                    </div>
                </div>
                <div className="following_container">
                    <div className="title">
                        Following
                    </div>
                    <div className="number">
                        <span>{followingCount}</span>
                    </div>
                </div>
                <div className="tracks_container">
                    <div className="title">
                        Tracks
                    </div>
                    <div className="number">
                        {tracks.length}
                    </div>
                </div>
            </div>

            <div className="profile_page_right_sidebar">
                <div className="profile_page_bio_container">
                    {user?.bio ? <span>{user.bio}</span> : <span>You don’t have bio :(</span>}
                </div>

                <div className="profile_page_following_users_container">
                    <div className="container_title_container">
                        <span className="header_txt_style">FOLLOWING</span>
                    </div>

                    {followingUsers.length === 0 ? (
                        <div className="user_info_container">
                            <span className="txt_style">You don`t have Followings</span>
                        </div>
                    ) : (
                        <div className="user_info_container">
                            {followingUsers.map(u => (
                                <div key={u.id} className="user_container">
                                    <div className="user_avatar_text_container">
                                        <div className="user_avatar_container">
                                            <img className="img_style" src={getUserImageUrl(user)} alt="avatar" />
                                        </div>
                                        <div className="user_text_container">{u.username}</div>
                                    </div>
                                    <div className="user_container">
                                        <button
                                            className={u.isFollowing ? "unfollow_button_container" : "follow_button_container"}
                                            onClick={() => toggleFollow(u.id)}
                                        >
                                            <span className="user_button_text_style">
                                                {u.isFollowing ? "Unfollow" : "Follow"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>








        </div>
    );
};

export default UserProfilePage;
