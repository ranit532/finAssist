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

  return (
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
          <Button variant="contained" sx={{ bgcolor: '#d32f2f', color: '#fff', fontWeight: 600, borderRadius: 2, px: 4, boxShadow: 'none', '&:hover': { bgcolor: '#b71c1c' } }} size="large">Human Agent Takeover</Button>
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 2, color: '#222', fontWeight: 500 }}>Key Items</Typography>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(insights?.key_items || []).map((item: string, idx: number) => (
            <li key={idx} style={{ color: '#222', fontSize: 14 }}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ConversationInsightsPanel;