import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

// 커뮤니티 게시판 컴포넌트
export default function CommunityTab() {
    // 사용자 ID 가져오기
    const { userId } = useContext(UserContext);

    // 게시물 상태 관리
    const [posts, setPosts] = useState([
        {
            id: 1,
            user: 'dietlover01',
            image: 'https://source.unsplash.com/featured/?salad',
            title: '헬시 샐러드 런치',
            description: '오늘 점심은 닭가슴살 샐러드로 건강하게 💪',
            hashtags: ['#저탄고지', '#헬시푸드'],
            likes: 12,
            comments: ['맛있어보여요!', '따라해볼게요!'],
        },
        {
            id: 2,
            user: 'fitgirl92',
            image: 'https://source.unsplash.com/featured/?chicken',
            title: '닭가슴살 정식',
            description: '단백질 가득한 저녁 식단 🍗',
            hashtags: ['#다이어트식단', '#단백질충전'],
            likes: 8,
            comments: ['이 조합 최고예요!', '간단하네요!'],
        },
    ]);

    // 좋아요, 댓글, 검색, 업로드 관련 상태
    const [liked, setLiked] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [activeTag, setActiveTag] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    const [showUploader, setShowUploader] = useState(false);

    // 새 게시물 입력 상태
    const [newPost, setNewPost] = useState({
        image: '',
        title: '',
        description: '',
        hashtags: '',
    });

    const [commentInputs, setCommentInputs] = useState({});

    // 추천 해시태그 리스트
    const hashtagList = ['#저탄고지', '#헬시푸드', '#다이어트식단', '#단백질충전', '#운동식단', '#간편식'];

    // 좋아요 토글
    const toggleLike = (id) => {
        setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === id
                    ? { ...post, likes: post.likes + (liked[id] ? -1 : 1) }
                    : post
            )
        );
    };

    // 댓글 표시 토글
    const toggleComments = (id) => {
        setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // 댓글 등록
    const handleCommentSubmit = (id) => {
        const newComment = commentInputs[id];
        if (!newComment) return;

        setPosts((prev) =>
            prev.map((post) =>
                post.id === id
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );
        setCommentInputs((prev) => ({ ...prev, [id]: '' }));
    };

    // 게시글 업로드 처리
    const handlePostSubmit = () => {
        if (!userId || !newPost.image || !newPost.title || !newPost.description) return;

        const hashtags = newPost.hashtags
            .split(' ')
            .filter((tag) => tag.startsWith('#'));

        const post = {
            id: Date.now(),
            user: userId,
            image: newPost.image,
            title: newPost.title,
            description: newPost.description,
            hashtags,
            likes: 0,
            comments: [],
        };

        setPosts([post, ...posts]);
        setNewPost({ image: '', title: '', description: '', hashtags: '' });
        setShowUploader(false);
    };

    // 해시태그 검색 필터
    const filteredPosts = posts.filter((post) =>
        activeTag
            ? post.hashtags.includes(activeTag)
            : post.hashtags.some((tag) => tag.includes(tagSearch))
    );

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">커뮤니티 식단 공유</h2>

            {/* 해시태그 검색 입력창 */}
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="해시태그 검색 #"
                    className="border px-3 py-1 rounded text-sm w-full"
                    value={tagSearch}
                    onChange={(e) => {
                        setTagSearch(e.target.value);
                        setActiveTag('');
                    }}
                />
                <button
                    onClick={() => setTagSearch('')}
                    className="text-sm text-gray-500"
                >
                    초기화
                </button>
            </div>

            {/* 추천 해시태그 리스트 */}
            <div className="flex flex-wrap gap-2">
                {hashtagList.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => {
                            setActiveTag(tag === activeTag ? '' : tag);
                            setTagSearch('');
                        }}
                        className={`px-3 py-1 text-sm rounded-full border ${activeTag === tag
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700'
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* 업로드 토글 버튼 */}
            <button
                onClick={() => setShowUploader(!showUploader)}
                className="mt-4 mb-2 px-4 py-2 bg-green-500 text-white text-sm rounded-full shadow"
            >
                {showUploader ? '업로드 닫기' : '📤 게시물 업로드'}
            </button>

            {/* 업로드 폼 */}
            {showUploader && (
                <div className="bg-white p-5 rounded-2xl shadow-lg space-y-3 border border-gray-200">
                    <h3 className="font-bold text-sm">새 게시물 업로드</h3>
                    <input
                        className="w-full border px-3 py-2 rounded-xl text-sm"
                        placeholder="이미지 URL"
                        value={newPost.image}
                        onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    />
                    <input
                        className="w-full border px-3 py-2 rounded-xl text-sm"
                        placeholder="제목"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <textarea
                        className="w-full border px-3 py-2 rounded-xl text-sm"
                        placeholder="내용"
                        value={newPost.description}
                        onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    />
                    <input
                        className="w-full border px-3 py-2 rounded-xl text-sm"
                        placeholder="해시태그 (예: #헬시푸드 #단백질충전)"
                        value={newPost.hashtags}
                        onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                    />
                    <button
                        onClick={handlePostSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm w-full"
                    >
                        등록 완료
                    </button>
                </div>
            )}

            {/* 게시글 목록 */}
            <div className="space-y-4">
                {filteredPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full mr-2" />
                            <p className="text-sm font-semibold">@{post.user}</p>
                        </div>
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 object-cover rounded mb-3"
                        />
                        <h3 className="font-semibold text-base">{post.title}</h3>
                        <p className="text-sm text-gray-700 mb-2">{post.description}</p>

                        {/* 해시태그 표시 */}
                        <div className="mb-2 flex flex-wrap gap-1 text-xs text-blue-600">
                            {post.hashtags.map((tag) => (
                                <span
                                    key={tag}
                                    className="cursor-pointer hover:underline"
                                    onClick={() => {
                                        setActiveTag(tag);
                                        setTagSearch('');
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* 좋아요와 댓글 버튼 */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => toggleLike(post.id)}
                                className="flex items-center text-sm text-red-500"
                            >
                                {liked[post.id] ? '❤️' : '🤍'} {post.likes}
                            </button>
                            <button
                                onClick={() => toggleComments(post.id)}
                                className="text-sm text-gray-500"
                            >
                                💬 댓글 {post.comments.length}
                            </button>
                        </div>

                        {/* 댓글 표시 및 입력 */}
                        {expandedComments[post.id] && (
                            <div className="mt-3 border-t pt-2 space-y-1 text-sm text-gray-700">
                                {post.comments.map((comment, idx) => (
                                    <p key={idx}>- {comment}</p>
                                ))}
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        className="border px-2 py-1 rounded text-sm w-full"
                                        placeholder="댓글 입력..."
                                        value={commentInputs[post.id] || ''}
                                        onChange={(e) =>
                                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                                        }
                                    />
                                    <button
                                        onClick={() => handleCommentSubmit(post.id)}
                                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                                    >
                                        등록
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
