import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, Avatar, Stack, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import IconButton from '@mui/material/IconButton';
import { sendChatRequest } from '../services/api';

interface ChatInterfaceProps {
  conversation: any[];
  setConversation: (conv: any[]) => void;
  setActiveStep: (step: number) => void;
  setInsights: (insights: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation, setConversation, setActiveStep, setInsights }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState('new');

  // TypeScript: declare SpeechRecognition types for browser
  // @ts-ignore
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  let recognition: any = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const handleSend = async () => {
    if (!input) return;
    setLoading(true);
    setActiveStep(1); // Listening
    const req = { text: input, session_id: sessionId };
    // Simulate listening stage
    await new Promise(res => setTimeout(res, 500));
    const res = await sendChatRequest(req);
    // Sync frontend stage with backend response
    switch (res.stage) {
      case 'understanding':
        setActiveStep(2);
        break;
      case 'searching':
        setActiveStep(3);
        break;
      case 'executing':
        setActiveStep(4);
        break;
      case 'responding':
        setActiveStep(5);
        break;
      default:
        setActiveStep(2);
    }
    setConversation([...conversation, { user: input, bot: res.text, time: new Date().toLocaleTimeString() }]);
    // Update sessionId after first greeting
    if (sessionId === 'new' && res.intent === 'greeting') {
      setSessionId('active');
    }
    // Play Azure TTS audio if available (base64)
    if (res.audio_data) {
      const byteString = atob(res.audio_data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } else if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(res.text);
      utter.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Female') || v.name.includes('Samantha')) || null;
      utter.pitch = 1.1;
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    }
    setLoading(false);
    // Fetch insights (simulate session_id)
    const insights = await sendChatRequest({ session_id: sessionId });
    setInsights(insights);
    setInput('');
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    setIsRecording(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      alert('Voice recognition error.');
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, bgcolor: '#fff', p: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Chat panel header */}
      <Box sx={{ bgcolor: '#d32f2f', color: '#fff', px: 3, py: 1.5, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Chat Bot
        </Typography>
      </Box>
      <Box sx={{ px: 3, py: 2, minHeight: 320, maxHeight: 400, overflowY: 'auto', bgcolor: '#fafafa' }}>
        {conversation.map((msg, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            {/* User message */}
            <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ mb: 1 }}>
              <Avatar sx={{ bgcolor: '#222', width: 32, height: 32 }}><PersonIcon /></Avatar>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, px: 2, py: 1, maxWidth: 400 }}>
                <Typography variant="caption" color="textSecondary">{msg.time}</Typography>
                <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>{msg.user}</Typography>
              </Box>
            </Stack>
            {/* Bot message */}
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <Avatar sx={{ bgcolor: '#d32f2f', width: 32, height: 32 }}><SmartToyIcon /></Avatar>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #d32f2f', borderRadius: 2, px: 2, py: 1, maxWidth: 400 }}>
                <Typography variant="caption" color="textSecondary">{msg.time}</Typography>
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500 }}>{msg.bot}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
      {/* Input area */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fff', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Type your message or use voice..."
            value={input}
            onChange={e => setInput(e.target.value)}
            fullWidth
            disabled={loading || isRecording}
            sx={{ bgcolor: '#fafafa', borderRadius: 2 }}
            size="small"
          />
          <IconButton color={isRecording ? "secondary" : "primary"} onClick={handleVoiceInput} disabled={loading || isRecording}>
            <MicIcon />
          </IconButton>
          <Button variant="contained" sx={{ bgcolor: '#d32f2f', color: '#fff', borderRadius: 2, px: 3, boxShadow: 'none', '&:hover': { bgcolor: '#b71c1c' } }} onClick={handleSend} disabled={loading || isRecording}>Send</Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ChatInterface;