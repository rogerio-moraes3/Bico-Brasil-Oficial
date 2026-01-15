import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MediaUpload } from '@/components/MediaUpload';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  media_url?: string;
  media_type?: string;
}

interface Conversation {
  id: string;
  contractor_id: string;
  worker_id: string;
  updated_at: string;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`contractor_id.eq.${user.id},worker_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar conversas",
        variant: "destructive"
      });
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar mensagens",
        variant: "destructive"
      });
    } else {
      setMessages(data || []);
      markAsRead(conversationId);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('read', false);
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMediaUpload = async (url: string, type: string) => {
    if (!selectedConversation || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: type.startsWith('image/') ? '📷 Imagem' : '📹 Vídeo',
        media_url: url,
        media_type: type
      });

    if (error) {
      toast({
        title: "Erro ao enviar mídia",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    } else {
      setNewMessage('');

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-muted/30 py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Breadcrumbs />

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {/* Conversations List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma conversa ainda
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation === conv.id ? 'bg-muted' : ''
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">Conversa</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {selectedConversation && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden text-[var(--nav-link)]"
                    >
                      <ArrowLeft className="h-4 w-4 text-[var(--nav-link)]" />
                    </Button>
                  )}
                  <CardTitle>
                    {selectedConversation ? 'Mensagens' : 'Selecione uma conversa'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <>
                    <ScrollArea className="h-[400px] mb-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`mb-4 flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${msg.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                              }`}
                          >
                            {msg.media_url && msg.media_type?.startsWith('image/') && (
                              <img
                                src={msg.media_url}
                                alt="Mídia"
                                className="rounded-lg mb-2 max-w-full"
                              />
                            )}
                            {msg.media_url && msg.media_type?.startsWith('video/') && (
                              <video
                                src={msg.media_url}
                                controls
                                className="rounded-lg mb-2 max-w-full"
                              />
                            )}
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </ScrollArea>

                    <div className="space-y-2">
                      <MediaUpload
                        bucket="chat-media"
                        onUpload={handleMediaUpload}
                      />
                      <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                        />
                        <Button type="submit" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    Selecione uma conversa para começar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
