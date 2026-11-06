import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../services/store';
import {
  X,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedIds?: string[];
  timestamp: string;
}

interface AskKisanRentProps {
  onSelectEquipment: (id: string) => void;
}

export const AskKisanRent: React.FC<AskKisanRentProps> = ({ onSelectEquipment }) => {
  const { i18n } = useTranslation();
  const { equipment, isOnline } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text:
        i18n.language === 'te'
          ? 'నమస్కారం! నేను KISAN CONNECT AI సహాయకుడిని. మీకు ఏ వ్యవసాయ యంత్రం కావాలో చెప్పండి (ఉదా: "విజయవాడ దగ్గర 45 HP ట్రాక్టర్ కావాలి").'
          : i18n.language === 'hi'
          ? 'नमस्ते! मैं KISAN CONNECT AI सहायक हूँ। आपको किस कृषि मशीनरी की आवश्यकता है? (जैसे: "विजयवाड़ा के पास 45 HP ट्रैक्टर चाहिए")।'
          : 'Welcome! I am KISAN CONNECT AI. Which agricultural machinery are you looking for today? (e.g., "Need a 45 HP tractor for 2 days near Vijayawada").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (i18n.language === 'te') {
        recognition.lang = 'te-IN';
      } else if (i18n.language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [i18n.language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!isOnline) {
        await new Promise((r) => setTimeout(r, 400));
        const offlineReply =
          i18n.language === 'te'
            ? 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. కాష్ చేయబడిన యంత్రాల జాబితా అందుబాటులో ఉంది.'
            : 'You are currently offline. Locally cached machinery listings are ready for booking.';

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: offlineReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: i18n.language,
          equipmentCatalog: equipment.map((eq) => ({
            id: eq.id,
            name: eq.name,
            category: eq.category,
            pricePerHour: eq.pricePerHour,
            pricePerDay: eq.pricePerDay,
            specs: eq.specs,
            location: eq.location,
            operatorIncluded: eq.operatorIncluded,
          })),
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        'I am ready to help you find equipment. Please let me know your crop or machine requirement.';

      const lowerQuery = query.toLowerCase();
      const lowerReply = replyText.toLowerCase();

      const matchedEquipment = equipment
        .filter((eq) => {
          const matchName =
            lowerReply.includes(eq.brand.toLowerCase()) || lowerReply.includes(eq.category.toLowerCase());
          const matchQuery = lowerQuery.includes(eq.category.toLowerCase());
          return matchName || matchQuery;
        })
        .slice(0, 2);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        suggestedIds: matchedEquipment.map((m) => m.id),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text:
          i18n.language === 'te'
            ? 'మా వద్ద మహీంద్రా మరియు జాన్ డీర్ ట్రాక్టర్లు గంటకు ₹650 నుండి అందుబాటులో ఉన్నాయి. మీరు శోధన పేజీలో నేరుగా ఫిల్టర్ చేసుకోవచ్చు!'
            : 'We have tractors, drone sprayers, and harvesters available near Vijayawada starting at ₹650/hour. You can view them in the Catalog tab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#1E3A2F] hover:bg-[#162E25] text-white px-3.5 py-2.5 rounded-lg shadow-matte-lg border border-[#2B4E3E] transition-colors flex items-center gap-2"
          aria-label="Open KISAN CONNECT AI"
        >
          <Bot className="w-4 h-4 text-[#D2924A]" strokeWidth={1.8} />
          <span className="text-xs font-semibold tracking-wide">KISAN CONNECT AI</span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 max-h-[520px] z-50 bg-white dark:bg-[#171F1A] rounded-xl shadow-matte-lg border border-[#E2E6E2] dark:border-[#233027] flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#1E3A2F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center text-[#D2924A]">
                <Bot className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-xs font-semibold leading-none">KISAN CONNECT AI</h3>
                <span className="text-[10px] text-[#A8BEB1]">
                  Machinery Advisor · AP & Telangana
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F7F9F7] dark:bg-[#121614] text-xs">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-md bg-[#1E3A2F] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-lg p-3 shadow-matte-sm space-y-2 ${
                      isAssistant
                        ? 'bg-white dark:bg-[#1A241F] text-[#19261E] dark:text-[#E5ECE7] border border-[#E2E6E2] dark:border-[#26352C]'
                        : 'bg-[#1E3A2F] text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                    {/* Equipment Suggestions */}
                    {isAssistant && m.suggestedIds && m.suggestedIds.length > 0 && (
                      <div className="pt-2 border-t border-[#E2E6E2] dark:border-[#26352C] space-y-1.5">
                        <span className="text-[10px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase tracking-wider block">
                          Suggested Machinery:
                        </span>
                        {m.suggestedIds.map((id) => {
                          const item = equipment.find((eq) => eq.id === id);
                          if (!item) return null;
                          return (
                            <div
                              key={item.id}
                              className="bg-[#F7F9F7] dark:bg-[#151D18] p-2 rounded-md border border-[#DCE2DC] dark:border-[#27352D] flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] block truncate">
                                  {item.name}
                                </span>
                                <span className="text-[10px] font-mono text-[#1E3A2F] dark:text-[#A8BEB1]">
                                  Rs {item.pricePerHour}/hr · {item.location.village}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  onSelectEquipment(item.id);
                                  setIsOpen(false);
                                }}
                                className="px-2 py-1 bg-[#1E3A2F] text-white text-[10px] font-semibold rounded shrink-0 flex items-center gap-1 shadow-matte-sm"
                              >
                                <span>View</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div
                      className={`text-[9px] text-right font-mono ${
                        isAssistant ? 'text-[#87998E]' : 'text-[#A8BEB1]'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-md bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 mb-0.5">
                      <User className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-[#5C6E63] dark:text-[#95A69B] italic text-[11px] bg-white dark:bg-[#171F1A] p-2.5 rounded-lg border border-[#E2E6E2] dark:border-[#233027] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E3A2F]" />
                <span>Searching catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-white dark:bg-[#171F1A] border-t border-[#E2E6E2] dark:border-[#233027] flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setInputText('Tractor for puddling near Vijayawada')}
              className="text-[10px] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] px-2.5 py-1 rounded border border-[#DCE2DC] dark:border-[#27352D] whitespace-nowrap shrink-0 hover:bg-[#EEF2EE]"
            >
              Tractor Vijayawada
            </button>
            <button
              onClick={() => setInputText('Need Paddy Harvester for 2 days')}
              className="text-[10px] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] px-2.5 py-1 rounded border border-[#DCE2DC] dark:border-[#27352D] whitespace-nowrap shrink-0 hover:bg-[#EEF2EE]"
            >
              Paddy Harvester
            </button>
            <button
              onClick={() => setInputText('Drone sprayer for cotton')}
              className="text-[10px] bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] px-2.5 py-1 rounded border border-[#DCE2DC] dark:border-[#27352D] whitespace-nowrap shrink-0 hover:bg-[#EEF2EE]"
            >
              Drone Sprayer
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-[#171F1A] border-t border-[#E2E6E2] dark:border-[#233027] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-md transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#5C6E63] hover:text-[#19261E]'
              }`}
              title={isListening ? 'Stop listening' : 'Voice search'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type in Telugu, Hindi or English...'}
              className="flex-1 py-1.5 px-3 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-md text-xs text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-[#1E3A2F] text-white rounded-md disabled:opacity-40 shadow-matte-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
