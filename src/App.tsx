import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Container } from '@mui/material';
import ChatInterface from './components/ChatInterface';
import AgentWorkflowVisualizer from './components/AgentWorkflowVisualizer';
import ConversationInsightsPanel from './components/ConversationInsightsPanel';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [conversation, setConversation] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  return (
    <Box sx={{ bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Toolbar sx={{ minHeight: 64, px: 3 }}>
          <img src="/dbb-logo.svg" alt="DBB Bank Logo" style={{ height: 40, marginRight: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', letterSpacing: 1, mr: 2 }}>
            DBB Bank AI Assistant
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="subtitle2" sx={{ color: '#d32f2f', fontWeight: 500, fontStyle: 'italic', letterSpacing: 1 }}>
            Your Digital Banking Buddy
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
        <Box sx={{ flex: 1, pr: 4 }}>
          <ConversationInsightsPanel insights={insights} />
        </Box>
        <Box sx={{ flex: 2 }}>
          <AgentWorkflowVisualizer activeStep={activeStep} />
          <ChatInterface
            conversation={conversation}
            setConversation={setConversation}
            setActiveStep={setActiveStep}
            setInsights={setInsights}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default App;