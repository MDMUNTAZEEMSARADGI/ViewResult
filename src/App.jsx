import React from 'react';
import ViewResult from './components/ViewResult';
import './index.css';

// Sample data structure for demonstration
const sampleLocation = {
  state: {
    userId: 'user123',
    testId: 'test456',
    topics: 'JavaScript,React,Node.js',
    interview: false
  }
};

// Mock Redux store props (you'll need to connect this to your actual Redux store)
const mockProps = {
  auth: {
    user: {
      role: 'admin' // or 'mentor', 'user', etc.
    },
    isAuthenticated: true
  },
  resultSheet: {
    resultSheet: [] // Your actual result data goes here
  },
  InterviewResults: {
    interviewResultSheet: [] // Your actual interview data goes here
  },
  // Redux action creators
  resultsheet: (params) => console.log('Fetching result sheet:', params),
  adduserfeedback: (feedback) => console.log('Adding feedback:', feedback),
  addFreeFormFeedback: (feedback) => console.log('Adding free form feedback:', feedback),
  getInterviewResultSheet: (params) => console.log('Fetching interview results:', params)
};

function App() {
  return (
    <div className="App">
      <ViewResult 
        location={sampleLocation}
        {...mockProps}
      />
    </div>
  );
}

export default App;