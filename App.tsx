
import React, { useState, useCallback, useEffect } from 'react';
import { VibeFile, ChatMessage, AIMode } from './types';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatPanel from './components/ChatPanel';
import { runChat, analyzeCode, refactorCodeWithThinking } from './services/geminiService';
import { Chat } from '@google/genai';

const initialFiles: VibeFile[] = [
  {
    id: 'welcome.js',
    name: 'welcome.js',
    content: `// Welcome to Vibe Code!
// Use the AI tools in the editor header to analyze or refactor your code.
// Ask the Vibe Bot anything in the chat panel on the right.

function greet(name) {
  console.log(\`Hello, \${name}! Let's start coding.\`);
}

greet('Developer');
`,
    language: 'javascript',
  },
  {
    id: 'styles.css',
    name: 'styles.css',
    content: `/* Give your web app some vibe! */
body {
  background-color: #1a202c;
  color: #cbd5e0;
  font-family: 'monospace', sans-serif;
}

.container {
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 1rem;
}
`,
    language: 'css',
  },
];

const App: React.FC = () => {
  const [files, setFiles] = useState<VibeFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>('welcome.js');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
    setChatHistory([
      { role: 'model', content: "Hey! I'm Vibe Bot. Ask me anything about your code or general questions." }
    ]);
  }, []);

  const handleFileSelect = (id: string) => {
    setActiveFileId(id);
  };

  const handleContentChange = (newContent: string) => {
    if (activeFileId) {
      setFiles(files.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
    }
  };

  const handleNewFile = () => {
    const fileName = prompt('Enter new file name:');
    if (fileName && !files.some(f => f.name === fileName)) {
      const newFile: VibeFile = {
        id: fileName,
        name: fileName,
        content: `// New file: ${fileName}`,
        language: fileName.split('.').pop() || 'text',
      };
      setFiles([...files, newFile]);
      setActiveFileId(newFile.id);
    } else if (fileName) {
      alert('A file with that name already exists.');
    }
  };

  const handleFileUpload = (file: VibeFile) => {
     if (!files.some(f => f.name === file.name)) {
      setFiles([...files, file]);
      setActiveFileId(file.id);
     } else {
        if(window.confirm(`File "${file.name}" already exists. Overwrite?`)){
            setFiles(files.map(f => f.name === file.name ? file : f));
            setActiveFileId(file.id);
        }
     }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      const { chatInstance, response } = await runChat(chat, message);
      if (!chat) setChat(chatInstance); // Save chat instance for conversation history
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I ran into an issue. Please check the console for details." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleAiAction = useCallback(async (mode: AIMode, code: string) => {
      setIsAiLoading(true);
      try {
        let result: string;
        if (mode === AIMode.ANALYZE) {
            result = await analyzeCode(code);
        } else if (mode === AIMode.REFACTOR) {
            result = await refactorCodeWithThinking(code);
        } else {
            return;
        }

        const aiResponseFile: VibeFile = {
            id: `ai-response-${Date.now()}.md`,
            name: `${mode}-response.md`,
            content: `## AI ${mode} Result for ${activeFileId}\n\n---\n\n${result}`,
            language: 'markdown',
        };
        setFiles(prev => [...prev, aiResponseFile]);
        setActiveFileId(aiResponseFile.id);
      } catch(error) {
         console.error(`AI Action Error (${mode}):`, error);
         alert(`An error occurred during AI ${mode}. Please check the console.`);
      } finally {
        setIsAiLoading(false);
      }
  }, [activeFileId]);

  const activeFile = files.find(f => f.id === activeFileId) || null;

  return (
    <div className="flex h-screen w-screen font-mono bg-gray-900 text-gray-200">
      <FileTree 
        files={files} 
        activeFileId={activeFileId} 
        onFileSelect={handleFileSelect}
        onNewFile={handleNewFile}
        onFileUpload={handleFileUpload}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Editor 
            activeFile={activeFile}
            onContentChange={handleContentChange}
            onAiAction={handleAiAction}
            isAiLoading={isAiLoading}
        />
      </main>
      <aside className="w-1/3 max-w-lg min-w-[300px] border-l border-gray-700">
        <ChatPanel 
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isAiLoading}
        />
      </aside>
    </div>
  );
};

export default App;
