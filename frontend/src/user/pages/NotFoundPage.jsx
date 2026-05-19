import React from 'react'
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/AppIcon';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        window.history.back();
    };
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-[#D4AF37] opacity-20">404</h1>
                    </div>
                </div>
                <h2 className="text-2xl font-medium text-onBackground mb-2">Page Not Found</h2>
                <p className="text-onBackground/70 mb-8">
                    The page you're looking for doesn't exist. Let's get you back!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-white border border-[#D4AF37]/50 px-6 py-3 rounded-lg font-medium hover:bg-[#b5952f] transition-colors duration-200"
                    >
                        <Icon name="ArrowLeftIcon" size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="inline-flex items-center justify-center gap-2 border bg-white/5 border-white/10 backdrop-blur-md text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-white/5 hover:border-white/20 hover:text-white transition-colors duration-200"
                    >
                        <Icon name="HomeIcon" size={16} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage