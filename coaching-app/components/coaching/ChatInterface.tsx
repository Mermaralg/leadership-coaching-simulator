'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/services/aiCoach';
import { ScoreProposal } from '@/lib/scoring/scoreInference';
import { ScoreValidation } from './ScoreValidation';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isLoading?: boolean;
  pendingProposal?: ScoreProposal | null;
  onValidateScore?: (adjustedScore?: number) => void;
  onRejectScore?: () => void;
}

export default function ChatInterface({ 
  onSendMessage, 
  messages, 
  isLoading,
  pendingProposal,
  onValidateScore,
  onRejectScore,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'assistant'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-amber-50 text-amber-900 text-sm italic'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Score validation UI */}
        {pendingProposal && onValidateScore && onRejectScore && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <ScoreValidation
                proposal={pendingProposal}
                onValidate={onValidateScore}
                onReject={onRejectScore}
              />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            style={{
              minHeight: '52px',
              maxHeight: '120px',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !!pendingProposal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
