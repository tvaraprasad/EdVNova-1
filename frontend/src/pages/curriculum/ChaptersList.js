import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ChaptersList() {
    const { board, subject } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const isLearnRoute = window.location.pathname.startsWith('/learn');
    const prefix = isLearnRoute ? '/learn' : '';

    useEffect(() => {
        axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}`)
            .then(res => {
                const chapters = res.data?.chapters;
                if (chapters && chapters.length > 0) {
                    // Go directly to first chapter's course workspace
                    navigate(`${prefix}/${board}/${subject}/${chapters[0].slug}`, { replace: true });
                } else {
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
    }, [board, subject, prefix, navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <p className="text-gray-500">No chapters available yet for this subject.</p>
        </div>
    );
}
