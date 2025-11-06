import React, { useState, useCallback, useEffect } from 'react';
import { VibeEntry, ChatMessage, AIMode } from './types';
import FileTree from './src/components/FileTree';
import Editor from './src/components/Editor';
import ChatPanel from './src/components/ChatPanel';
import ScaffoldModal from './src/components/ScaffoldModal';
import { runChat, analyzeCode, refactorCodeWithThinking, scaffoldProject } from './services/geminiService';
import { Chat } from '@google/genai';

const initialEntries: VibeEntry[] = [
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
    type: 'file',
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
    type: 'file',
  },
  {
    id: 'assets',
    name: 'assets',
    content: '',
    language: '',
    type: 'folder',
  },
];

const App: React.FC = () => {
  const [entries, setEntries] = useState<VibeEntry[]>(initialEntries);
  const [activeId, setActiveId] = useState<string | null>('welcome.js');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isScaffoldModalOpen, setIsScaffoldModalOpen] = useState(false);

  useEffect(() => {
    setChatHistory([
      { role: 'model', content: "Hey! I'm Vibe Bot. Ask me anything about your code or general questions." }
    ]);
  }, []);

  const handleSelect = (id: string) => {
    setActiveId(id);
  };

  const handleContentChange = (newContent: string) => {
    if (activeId) {
      setEntries(entries.map(e => e.id === activeId ? { ...e, content: newContent } : e));
    }
  };

  const handleNewFile = () => {
    const fileName = prompt('Enter new file name:');
    if (fileName && !entries.some(e => e.name === fileName)) {
      const newFile: VibeEntry = {
        id: fileName,
        name: fileName,
        content: `// New file: ${fileName}`,
        language: fileName.split('.').pop() || 'text',
        type: 'file',
      };
      setEntries([...entries, newFile]);
      setActiveId(newFile.id);
    } else if (fileName) {
      alert('A file with that name already exists.');
    }
  };

  const handleNewFolder = () => {
    const folderPath = prompt('Enter folder path (e.g., src/components):');
    if (folderPath && !entries.some(e => e.id === folderPath)) {
      const newFolder: VibeEntry = {
        id: folderPath,
        name: folderPath.split('/').pop() || folderPath,
        content: '',
        language: '',
        type: 'folder',
      };
      setEntries([...entries, newFolder]);
      setActiveId(newFolder.id);
    } else if (folderPath) {
      alert('A folder with that path already exists.');
    }
  };

  const handleFileUpload = (file: VibeEntry) => {
    if (!entries.some(e => e.name === file.name)) {
      setEntries([...entries, file]);
      setActiveId(file.id);
    } else {
      if (window.confirm(`File "${file.name}" already exists. Overwrite?`)) {
        setEntries(entries.map(e => e.name === file.name ? file : e));
        setActiveId(file.id);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      const { chatInstance, response } = await runChat(chat, message);
      if (!chat) setChat(chatInstance);
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

      const aiResponseFile: VibeEntry = {
        id: `ai-response-${Date.now()}.md`,
        name: `${mode}-response.md`,
        content: `## AI ${mode} Result for ${activeId}\n\n---\n\n${result}`,
        language: 'markdown',
        type: 'file',
      };
      setEntries(prev => [...prev, aiResponseFile]);
      setActiveId(aiResponseFile.id);
    } catch (error) {
      console.error(`AI Action Error (${mode}):`, error);
      alert(`An error occurred during AI ${mode}. Please check the console.`);
    } finally {
      setIsAiLoading(false);
    }
  }, [activeId]);

  const handleScaffold = async (prompt: string) => {
    setIsAiLoading(true);
    try {
      const newEntries = await scaffoldProject(prompt);
      setEntries(prev => [...prev, ...newEntries]);
      setIsScaffoldModalOpen(false);
      if (newEntries.length > 0) {
        setActiveId(newEntries[0].id);
      }
    } catch (error) {
      console.error("Scaffold error:", error);
      alert("An error occurred during scaffolding. Please check the console.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const activeEntry = entries.find(e => e.id === activeId) || null;

  return (
    <div className="flex h-screen w-screen font-mono bg-gray-900 text-gray-200">
      <FileTree
        entries={entries}
        activeId={activeId}
        onSelect={handleSelect}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onFileUpload={handleFileUpload}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Editor
          activeEntry={activeEntry}
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
      <ScaffoldModal
        isOpen={isScaffoldModalOpen}
        onClose={() => setIsScaffoldModalOpen(false)}
        onScaffold={handleScaffold}
        isLoading={isAiLoading}
      />
    </div>
  );
};

export default App;
