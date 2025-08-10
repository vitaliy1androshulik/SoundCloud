import React, { useState } from 'react';

const tabs = ['Overview', 'Likes', 'Playlists', 'Albums', 'Stations', 'Following', 'History'];

const LibraryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <p>Recently played</p>;
            case 'Likes':
                return <p>Your liked songs</p>;
            case 'Playlists':
                return <p>Your playlists</p>;
            case 'Albums':
                return <p>Your albums</p>;
            case 'Stations':
                return <p>Your stations</p>;
            case 'Following':
                return <p>Artists you follow</p>;
            case 'History':
                return <p>Your listening history</p>;
            default:
                return null;
        }
    };

    return (
        <div className="text-white p-6 min-h-screen">
            <div className="flex justify-center space-x-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 text-xl ${
                            activeTab === tab
                                ? 'text-white border-b-2 border-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="mt-6 text-center text-sm font-semibold">
                {renderContent()}
            </div>
        </div>
    );
};

export default LibraryPage;