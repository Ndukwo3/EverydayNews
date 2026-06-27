const Comment = ({ comment }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes || 0);

    const handleLike = () => {
        if (!liked) {
            setLiked(true);
            setLikeCount(likeCount + 1);
        }
    };

    return (
        <div className="comment">
            <div className="user-info">
                <span className="username">{comment.user}</span>
                <span className="timestamp">{comment.timestamp}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
            <div className="actions">
                <button 
                    onClick={handleLike}
                    className={`like-btn ${liked ? 'liked' : ''}`}
                >
                    <span className="heart-icon">❤️</span>
                    <span className="like-count">{likeCount}</span>
                </button>
                <button className="reply-btn">Reply</button>
            </div>
        </div>
    );
};
