'use client'

import Link from 'next/link';
import { useState } from 'react';
import VideoPlayer from './VideoPlayer';

export default function Home() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchVideosFromYouTube = async (query: string): Promise<string[]> => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => `https://www.youtube.com/embed/${item.id.videoId}`);
    }

    return [];
  };

  const fetchChatGPTResponse = async (query: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: query }
        ]
      })
    });
    const data = await response.json();

    return data.choices[0]?.message?.content || 'No response';
  };

  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setChatResponse(null);

    try {
      // Fetch videos from YouTube
      const fetchedVideos = await fetchVideosFromYouTube(query);
      setVideos(fetchedVideos);

      // Fetch response from ChatGPT
      const response = await fetchChatGPTResponse(query);
      setChatResponse(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main>
        <div className='text-center'>
          <h1 className='my-4 text-4xl font-bold'>
            Boxed Situation
          </h1>
          <div className='flex justify-center items-center'>
            {videos.length === 0 ? (
              <div className='video-placeholder'>
                <div className='placeholder-content hvh'>
                  {/* Placeholder content */}

                </div>
              </div>
            ) : (
              videos.map((url, index) => (
                <VideoPlayer key={index} url={url} />
              ))
            )}
          </div>
          <div className="relative m-10">
            <label htmlFor="Search" className="sr-only">Search</label>
            <input
              type="text"
              id="Search"
              placeholder="Enter a situation and get a boxing solution"
              className="w-full rounded-md border-gray-700 py-2.5 px-4 pe-10 shadow-xl sm:text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-700"
                onClick={handleSearch}
                disabled={loading}
              >
                <span className="sr-only">Search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>
            </span>
          </div>
          <div className="m-10">
            <h1 className="text-xl font-semibold">Examples:</h1>
            <p className="text-gray-900">
              Type a specific scenario and see which boxing technique best matches it!
            </p>
            <p className="text-gray-700">
              Simple as: someone is throwing a bottle at you, Complex as: it is a Saturday night out with the boys and 3 attackers appear.
            </p>
          </div>
          <div className='h-28'>
            {chatResponse && (
              <div className="m-10 p-4 border rounded-md shadow-md">
                <h2 className="text-xl font-semibold">ChatGPT Response:</h2>
                <p>{chatResponse}</p>
              </div>
            )}
            {error && (
              <div className="m-10 p-4 border rounded-md shadow-md bg-red-100 text-red-700">
                <h2 className="text-xl font-semibold">Error:</h2>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </main >
      <footer className='pb-4 flex justify-center gap-10'>
        <Link href="terms">terms</Link>
        <Link href="privacy">privacy</Link>
      </footer>
    </>
  );
}
