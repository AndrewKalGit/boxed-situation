'use client'

import React from 'react';

interface VideoPlayerProps {
    url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
    return (
        <div className="video-player-container">
            <iframe
                width="560"
                height="315"
                src={url}
                title="Video player"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default VideoPlayer;
