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
    <Box sx={{ mb: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#222', fontWeight: 700 }}>Agent Workflow</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ bgcolor: 'transparent', py: 2 }}>
        {steps.map((label, idx) => (
          <Step key={label}>
            <StepLabel
              sx={{
                color: activeStep === idx ? '#d32f2f' : '#888',
                fontWeight: activeStep === idx ? 700 : 400,
                '.MuiStepIcon-root': {
                  color: activeStep === idx ? '#d32f2f' : '#e0e0e0',
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default AgentWorkflowVisualizer;