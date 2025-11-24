import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, Avatar, Stack } from '@mui/material';
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
    <Box>
      <Box sx={{ mb: 2 }}>
        {conversation.map((msg, idx) => (
          <Stack direction="row" spacing={2} alignItems="flex-start" key={idx} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2' }}><PersonIcon /></Avatar>
            <Card sx={{ flex: 1, bgcolor: '#f1f8e9' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">{msg.time}</Typography>
                <Typography variant="body1"><b>User:</b> {msg.user}</Typography>
              </CardContent>
            </Card>
            <Avatar sx={{ bgcolor: '#e91e63' }}><SmartToyIcon /></Avatar>
            <Card sx={{ flex: 1, bgcolor: '#fce4ec' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">{msg.time}</Typography>
                <Typography variant="body1"><b>Bot:</b> {msg.bot}</Typography>
              </CardContent>
            </Card>
          </Stack>
        ))}
      </Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Type your message or use voice..."
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
          disabled={loading || isRecording}
        />
        <IconButton color={isRecording ? "secondary" : "primary"} onClick={handleVoiceInput} disabled={loading || isRecording}>
          <MicIcon />
        </IconButton>
        <Button variant="contained" onClick={handleSend} disabled={loading || isRecording}>Send</Button>
        {/* TODO: Add voice input/output buttons */}
      </Stack>
    </Box>
  );
};

export default ChatInterface;