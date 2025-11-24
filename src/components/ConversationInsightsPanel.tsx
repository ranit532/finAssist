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
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Conversation Insights</Typography>
        <Typography variant="subtitle2">Real time sentiment Analysis</Typography>
        <Box sx={{ height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="time" />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Overall Sentiment Distribution</Typography>
        <Box sx={{ height: 180 }}>
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
          <Button variant="contained" color="error" size="large">Human Agent Takeover</Button>
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Key Items</Typography>
        <ul>
          {(insights?.key_items || []).map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ConversationInsightsPanel;