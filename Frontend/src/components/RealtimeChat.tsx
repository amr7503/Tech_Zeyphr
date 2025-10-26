import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ChatMessage {
    id?: string;
    room: string;
    from: string;
    text: string;
    timestamp?: number;
}

const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function RealtimeChat({ defaultRoom, inline = false }: { defaultRoom?: string; inline?: boolean }) {
    const [connected, setConnected] = useState(false);
    const [room, setRoom] = useState(defaultRoom || 'global-room');
    const [name, setName] = useState('Anonymous');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const messagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current && connected) {
            const s = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
            socketRef.current = s;

            s.on('connect', () => {
                console.log('chat socket connected', s.id);
                if (room) s.emit('joinRoom', room);
            });

            s.on('receiveMessage', (msg: ChatMessage) => {
                setMessages((prev) => [...prev, msg]);
            });

            s.on('disconnect', () => console.log('chat socket disconnected'));
        }
        if (socketRef.current && connected) {
            socketRef.current.emit('joinRoom', room);
        }
        if (socketRef.current && !connected) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, [connected, room]);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleToggle = () => setConnected((c) => !c);

    const handleSend = () => {
        if (!input || !room || !socketRef.current) return;
        const payload: ChatMessage = { room, from: name || 'Anonymous', text: input };
        socketRef.current.emit('sendMessage', payload);
        setInput('');
    };

        const outerClass = inline ? 'w-full' : 'fixed bottom-6 right-6 z-50 w-96';

        return (
            <div className={outerClass}>
                <Card className={inline ? 'p-2 w-full' : 'p-3'}>
                <div className="flex items-center gap-2 mb-2">
                    <Input placeholder="Your name" value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
                    <Button onClick={handleToggle} size="sm">{connected ? 'Disconnect' : 'Connect'}</Button>
                </div>

                <div className="flex gap-2 mb-2">
                    <Input placeholder="Room id (project id)" value={room} onChange={(e) => setRoom((e.target as HTMLInputElement).value)} />
                    <Button onClick={() => { if (socketRef.current) socketRef.current.emit('joinRoom', room); }} size="sm">Join</Button>
                </div>

                <div ref={messagesRef} className="h-48 overflow-auto p-2 mb-2 bg-muted rounded">
                    {messages.map((m, i) => (
                        <div key={i} className={`p-2 my-1 rounded ${m.from === name ? 'bg-primary text-primary-foreground ml-auto' : 'bg-white/80'}`}>
                            <div className="text-xs text-muted-foreground">{m.from} • {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}</div>
                            <div className="text-sm">{m.text}</div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Input placeholder="Message..." value={input} onChange={(e) => setInput((e.target as HTMLInputElement).value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                    <Button onClick={handleSend}>Send</Button>
                </div>
            </Card>
        </div>
    );
}
