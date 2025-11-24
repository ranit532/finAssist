import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface ConversationInsightsPanelProps {
  insights: any;
}

const COLORS = ['#4caf50', '#f44336', '#ffeb3b'];

const ConversationInsightsPanel: React.FC<ConversationInsightsPanelProps> = ({ insights }) => {
  const sentimentData = insights?.sentiment_distribution
    ? Object.entries(insights.sentiment_distribution).map(([key, value]) => ({ name: key, value }))
    : [
        { name: 'Positive', value: 0 },
        { name: 'Negative', value: 0 },
        { name: 'Neutral', value: 100 }
      ];

  const lineData = insights?.sentiment_trend || [
    { time: 'Start', value: 0 },
    { time: 'End', value: 0 }
  ];

  // Human Agent UI escalation logic
  const isHumanAgentActive = insights?.intent === 'human_agent';
  const [showRing, setShowRing] = React.useState(false);
  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isHumanAgentActive) {
      setShowRing(true);
      timer = setTimeout(() => setShowRing(false), 30000);
    } else {
      setShowRing(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHumanAgentActive]);

  return (
    <>
      <Card elevation={0} sx={{ mb: 4, bgcolor: '#f5f5f5', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e0e0e0' }}>
        <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#222', fontWeight: 700 }}>Conversation Insights</Typography>
        <Typography variant="subtitle2" sx={{ color: '#222', fontWeight: 500 }}>Real time sentiment Analysis</Typography>
        <Box sx={{ height: 150, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="time" stroke="#888" fontSize={12} />
              <YAxis domain={[-1, 1]} stroke="#888" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#d32f2f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        {/* End Human Agent Takeover UI escalation */}
        <Typography variant="subtitle2" sx={{ mt: 2, color: '#222', fontWeight: 500 }}>Overall Sentiment Distribution</Typography>
        <Box sx={{ height: 180, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: isHumanAgentActive ? '#43a047' : '#d32f2f',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              boxShadow: 'none',
              '&:hover': { bgcolor: isHumanAgentActive ? '#388e3c' : '#b71c1c' },
              transition: 'background 0.3s',
            }}
            size="large"
          >
            Human Agent Takeover
          </Button>
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 2, color: '#222', fontWeight: 500 }}>Key Items</Typography>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(insights?.key_items || []).map((item: string, idx: number) => (
            <li key={idx} style={{ color: '#222', fontSize: 14 }}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
    {showRing && (
      <>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.35)',
          zIndex: 3000,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }} />
        <Box sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#fff',
          color: '#222',
          px: 5,
          py: 4,
          borderRadius: 3,
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          fontWeight: 700,
          fontSize: 22,
          zIndex: 4000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span role="img" aria-label="alert" style={{ fontSize: 36, marginBottom: 16 }}>🔔</span>
          Connecting to you a human agent!
        </Box>
      </>
    )}
    </>
  );
};

export default ConversationInsightsPanel;