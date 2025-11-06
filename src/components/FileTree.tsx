import React, { useState, useMemo } from 'react';
import { VibeEntry } from '../types';
import { buildTree, TreeNode } from '../utils/tree';
import FileIcon from './icons/FileIcon';
import UploadIcon from './icons/UploadIcon';
import ImageIcon from './icons/ImageIcon';
import FolderIcon from './icons/FolderIcon';
import FolderOpenIcon from './icons/FolderOpenIcon';

interface FileTreeProps {
  entries: VibeEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onFileUpload: (file: VibeEntry) => void;
}

const getIcon = (entry: VibeEntry, isExpanded: boolean) => {
  switch (entry.type) {
    case 'image':
      return <ImageIcon className="w-5 h-5 flex-shrink-0" />;
    case 'folder':
      return isExpanded 
        ? <FolderOpenIcon className="w-5 h-5 flex-shrink-0 text-purple-400" /> 
        : <FolderIcon className="w-5 h-5 flex-shrink-0 text-purple-400" />;
    case 'file':
    default:
      return <FileIcon className="w-5 h-5 flex-shrink-0" />;
  }
};

const TreeItem: React.FC<{
  node: TreeNode;
  activeId: string | null;
  onSelect: (id: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  level: number;
}> = ({ node, activeId, onSelect, expandedFolders, toggleFolder, level }) => {
  const isExpanded = expandedFolders.has(node.id);

  const handleSelect = () => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    }
    onSelect(node.id);
  };

  return (
    <li>
      <button
        onClick={handleSelect}
        style={{ paddingLeft: `${0.75 + level * 1}rem` }}
        className={`w-full text-left py-1.5 pr-3 rounded flex items-center space-x-2 transition-colors duration-150 ${
          activeId === node.id
            ? 'bg-purple-500/20 text-purple-300'
            : 'hover:bg-slate-700 text-slate-300'
        }`}
      >
        {getIcon(node, isExpanded)}
        <span className="truncate">{node.name}</span>
      </button>
      {node.type === 'folder' && isExpanded && (
        <ul>
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};


const FileTree: React.FC<FileTreeProps> = ({ entries, activeId, onSelect, onNewFile, onNewFolder, onFileUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['assets']));

  const tree = useMemo(() => buildTree(entries), [entries]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const id = isImage ? `assets/${file.name}` : file.name;
        
        const uploadedFile: VibeEntry = {
            id: id,
            name: file.name,
            content: content,
            language: file.name.split('.').pop() || (isImage ? 'image' : 'text'),
            type: isImage ? 'image' : 'file'
        };
        onFileUpload(uploadedFile);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
      event.target.value = ''; // Reset input
    }
  };

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-purple-400">Vibe Code</h1>
      </div>
      <div className="p-2 grid grid-cols-2 gap-2">
        <button onClick={onNewFile} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-2 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-1.5">
          <FileIcon className="w-4 h-4" />
          <span>New File</span>
        </button>
        <button onClick={onNewFolder} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-2 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-1.5">
          <FolderIcon className="w-4 h-4" />
          <span>New Folder</span>
        </button>
         <button onClick={handleUploadClick} className="col-span-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-3 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-2">
           <UploadIcon className="w-4 h-4" />
           <span>Upload File/Image</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul>
          {tree.map(node => (
            <TreeItem 
              key={node.id} 
              node={node} 
              activeId={activeId} 
              onSelect={onSelect} 
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              level={0} 
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default FileTree;
