import React, { useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface ScaffoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScaffold: (prompt: string) => void;
  isLoading: boolean;
}

const ScaffoldModal: React.FC<ScaffoldModalProps> = ({ isOpen, onClose, onScaffold, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onScaffold(prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl p-6 flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3">
            <SparkleIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-slate-100">Scaffold with AI</h2>
        </div>
        <p className="text-slate-400">
            Describe the component, feature, or files you want to create. The AI will generate the necessary folder structure and code.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A login form component with email and password fields, and a submit button."
                className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow resize-none"
                disabled={isLoading}
            />
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 transition-colors">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading || !prompt.trim()} 
                    className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-semibold flex items-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <span>Generate Files</span>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ScaffoldModal;
