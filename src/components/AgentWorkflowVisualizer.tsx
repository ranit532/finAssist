import React from 'react';
import { Stepper, Step, StepLabel, Box, Typography } from '@mui/material';

interface AgentWorkflowVisualizerProps {
  activeStep: number;
}

const steps = [
  'Listening',
  'Understanding',
  'Searching',
  'Executing',
  'Responding'
];

const AgentWorkflowVisualizer: React.FC<AgentWorkflowVisualizerProps> = ({ activeStep }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Agent Workflow</Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, idx) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default AgentWorkflowVisualizer;