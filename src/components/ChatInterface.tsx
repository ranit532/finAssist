import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, Avatar, Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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

  const handleSend = async () => {
    if (!input) return;
    setLoading(true);
    setActiveStep(1); // Listening
    const req = { text: input };
    const res = await sendChatRequest(req);
    setConversation([...conversation, { user: input, bot: res.text, time: new Date().toLocaleTimeString() }]);
    setActiveStep(2); // Understanding
    setTimeout(() => setActiveStep(3), 500); // Searching
    setTimeout(() => setActiveStep(4), 1000); // Executing
    setTimeout(() => setActiveStep(5), 1500); // Responding
    setLoading(false);
    // Fetch insights (simulate session_id)
    const insights = await sendChatRequest({ session_id: 'demo' });
    setInsights(insights);
    setInput('');
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
          disabled={loading}
        />
        <Button variant="contained" onClick={handleSend} disabled={loading}>Send</Button>
        {/* TODO: Add voice input/output buttons */}
      </Stack>
    </Box>
  );
};

export default ChatInterface;