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
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <img src="/logo192.png" alt="Logo" style={{ height: 40, marginRight: 16 }} />
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
            Customer Service Reimagined
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Through Agentic AI
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
        <Box sx={{ flex: 1, pr: 4 }}>
          <ConversationInsightsPanel insights={insights} />
        </Box>
        <Box sx={{ flex: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: 4 }}>
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