
import React from 'react';
import { PPTGeneratorTab } from '@/components/dashboard/PPTGeneratorTab';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PPTGenerator = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen mesh-gradient p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[80vh]">
                    <PPTGeneratorTab />
                </div>
            </div>
        </div>
    );
};

export default PPTGenerator;
