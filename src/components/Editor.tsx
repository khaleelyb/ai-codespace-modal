import React, { useState, useEffect } from 'react';
import { VibeEntry, AIMode } from '../types';
import SaveIcon from './icons/SaveIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparkleIcon from './icons/SparkleIcon';
import BrainIcon from './icons/BrainIcon';
import PreviewIcon from './icons/PreviewIcon';
// Fix: Import FolderIcon component
import FolderIcon from './icons/FolderIcon';

declare const marked: any;
declare const DOMPurify: any;

interface EditorProps {
  activeEntry: VibeEntry | null;
  onContentChange: (newContent: string) => void;
  onAiAction: (mode: AIMode, code: string) => void;
  isAiLoading: boolean;
}

const PREVIEWABLE_LANGUAGES = ['markdown', 'html'];

const Editor: React.FC<EditorProps> = ({ activeEntry, onContentChange, onAiAction, isAiLoading }) => {
  const [showPreview, setShowPreview] = useState(false);
  const isPreviewable = activeEntry?.type === 'file' && PREVIEWABLE_LANGUAGES.includes(activeEntry.language || '');
  
  useEffect(() => {
    // Disable preview if the new file is not previewable
    if (activeEntry && !isPreviewable) {
      setShowPreview(false);
    }
  }, [activeEntry, isPreviewable]);

  const handleDownload = () => {
    if (!activeEntry || activeEntry.type === 'folder' || !activeEntry.content) return;

    if (activeEntry.type === 'image') {
       const a = document.createElement('a');
       a.href = activeEntry.content;
       a.download = activeEntry.name;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
    } else {
      const blob = new Blob([activeEntry.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeEntry.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = () => {
     if (!activeEntry) return;
     alert(`${activeEntry.name} saved! (simulated)`);
  };

  const AiButton: React.FC<{mode: AIMode, icon: React.ReactNode}> = ({mode, icon}) => (
    <button
        onClick={() => activeEntry?.content && onAiAction(mode, activeEntry.content)}
        disabled={!activeEntry || isAiLoading || activeEntry.type !== 'file'}
        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-600 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors text-sm"
    >
        {icon}
        <span>{isAiLoading ? 'Working...' : mode}</span>
    </button>
  );

  const EditorView = () => {
    if (!activeEntry) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
          Select a file to start editing or create a new one.
        </div>
      );
    }
    
    if (activeEntry.type === 'folder') {
        return (
             <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                    <FolderIcon className="w-16 h-16 mx-auto text-slate-600" />
                    <p className="mt-2">Folder: <span className="font-semibold text-slate-400">{activeEntry.name}</span></p>
                </div>
            </div>
        )
    }

    if (activeEntry.type === 'image') {
      return (
        <div className="flex-1 p-4 bg-slate-900 flex items-center justify-center overflow-auto">
           <img src={activeEntry.content} alt={activeEntry.name} className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
       </div>
      )
    }
    
    // It's a file
    return (
       <div className="flex flex-1 min-h-0">
          <textarea
            value={activeEntry.content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-full p-4 bg-transparent text-slate-200 font-mono resize-none focus:outline-none leading-relaxed"
            spellCheck="false"
          />
          {showPreview && isPreviewable && (
            <div className="w-full h-full border-l border-slate-700 p-4 overflow-y-auto bg-slate-900/50">
                {activeEntry.language === 'markdown' && (
                    <div 
                        className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(activeEntry.content || '')) }}
                    />
                )}
                 {activeEntry.language === 'html' && (
                    <iframe
                        srcDoc={activeEntry.content}
                        title="HTML Preview"
                        sandbox="allow-scripts"
                        className="w-full h-full bg-white rounded-md"
                    />
                )}
            </div>
          )}
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-800">
      <header className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-900/50 flex-shrink-0">
        <div className="text-slate-400 text-sm truncate">{activeEntry?.id || 'No file selected'}</div>
        <div className="flex items-center space-x-2">
           <AiButton mode={AIMode.ANALYZE} icon={<SparkleIcon className="w-4 h-4 text-cyan-300" />} />
           <AiButton mode={AIMode.REFACTOR} icon={<BrainIcon className="w-4 h-4 text-purple-300" />} />
           
           <div className="h-6 border-l border-slate-600 mx-2"></div>

            <button title="Preview" onClick={() => setShowPreview(!showPreview)} disabled={!isPreviewable} className={`p-2 rounded-md transition-colors ${showPreview ? 'bg-purple-500/30 text-purple-300' : 'hover:bg-slate-600'} disabled:text-slate-600 disabled:cursor-not-allowed disabled:hover:bg-transparent`}>
                <PreviewIcon className="w-5 h-5"/>
            </button>
            <button title="Save" onClick={handleSave} className="p-2 rounded-md hover:bg-slate-600 transition-colors">
              <SaveIcon className="w-5 h-5"/>
            </button>
            <button title="Download" onClick={handleDownload} className="p-2 rounded-md hover:bg-slate-600 transition-colors">
              <DownloadIcon className="w-5 h-5"/>
            </button>
        </div>
      </header>
      <EditorView />
    </div>
  );
};

export default Editor;