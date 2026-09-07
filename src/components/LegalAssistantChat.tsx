import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export const LegalAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', parts: [{text: string}]}>([
    { role: 'model', parts: [{ text: "Hello. I am the WA Pro Se Legal Assistant. I can help guide you through procedural steps or general family law concepts in Washington State. I cannot provide legal advice. How can I assist you today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const newMessages = [...messages, { role: 'user', parts: [{ text: input.trim() }] }] as any;
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages })
      });
      const data = await res.json();
      
      if (data.text) {
        setMessages([...newMessages, { role: 'model', parts: [{ text: data.text }] }]);
      } else {
        setMessages([...newMessages, { role: 'model', parts: [{ text: "Error: Unable to connect to inference engine." }] }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'model', parts: [{ text: "Error: Network failure." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-accent hover:bg-[#00e53a] text-black w-12 h-12 rounded-full shadow-[0_0_20px_rgba(0,255,65,0.3)] flex items-center justify-center transition-transform hover:scale-110"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-[#0d0d0e] border border-accent shadow-2xl z-50 flex flex-col font-sans">
          <div className="bg-[#111] border-b border-accent/50 p-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-accent">
              <Bot className="w-4 h-4" />
              <span className="font-oswald uppercase text-sm tracking-wide">Procedural Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-ink-muted hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-ink-faint' : 'bg-accent/10 border border-accent/30'}`}>
                  {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-accent" />}
                </div>
                <div className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-ink-muted'}`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-accent/10 border border-accent/30">
                  <Bot className="w-3 h-3 text-accent" />
                </div>
                <div className="text-[13px] text-accent animate-pulse font-mono">
                  Processing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-ink-faint bg-black flex gap-2 shrink-0">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a procedural question..."
              className="flex-1 bg-[#111] border border-ink-faint text-white px-3 py-2 text-xs focus:outline-none focus:border-accent"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-accent text-black px-3 py-2 disabled:opacity-50 hover:bg-[#00e53a] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
