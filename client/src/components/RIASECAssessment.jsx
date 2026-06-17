import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const RIASECAssessment = ({ onCompletion }) => {
  const { user, completeAssessment, refreshUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRetest, setIsRetest] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const assessmentQuestions = await api.getRIASECQuestions();
        setQuestions(assessmentQuestions);
      } catch (error) {
        console.error('Error fetching assessment questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      // Check which questions are unanswered
      const unanswered = questions.filter(q => !answers[q.id]);
      if (unanswered.length > 0) {
        alert(`Please answer all questions. You have ${unanswered.length} unanswered questions.`);
        // Scroll to first unanswered question
        const firstUnansweredIndex = questions.findIndex(q => !answers[q.id]);
        setCurrentQuestionIndex(firstUnansweredIndex);
        return;
      }
    }

    setSubmitting(true);
    try {
      const results = await api.submitRIASECAnswers(answers);
      setRecommendations(results.matches);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCareerSelect = async (career) => {
    setSelectedCareer(career);
    try {
      // Send the selected career to the server
      const response = await api.selectCareer(career.career_id);
      
      // If career changed, refresh user data and show appropriate message
      if (response.careerChanged) {
        // Refresh the user data to reflect the selected career
        await refreshUser();
        
        // Show message about reset
        alert(`You've selected ${career.career_name} as your new career path. Your previous tasks, XP, and goals have been reset. You'll now receive new tasks and goals tailored to this career.`);
      } else {
        // Refresh the user data to reflect the selected career
        await refreshUser();
      }
      
      completeAssessment();
      
      if (onCompletion) {
        onCompletion(career);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Failed to complete assessment. Please try again.');
    }
  };

  const handleRetake = () => {
    // Reset all state for retest
    setRecommendations(null);
    setSelectedCareer(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsRetest(true);
  };

  if (loading) {
    return (
      <div className="riasec-assessment loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Loading Career Assessment...</h2>
        <div className="loading">Please wait while we prepare your comprehensive assessment.</div>
        <div className="loading-details">This assessment contains 36 questions to provide you with the most accurate career recommendations.</div>
      </div>
    );
  }

  if (recommendations && !selectedCareer) {
    return (
      <div className="riasec-assessment results">
        <div className="confetti-header">
          <h2>Your Results!</h2>
        </div>
        <h2>Your Career Recommendations</h2>
        <p>Based on your comprehensive assessment, here are the career paths that match your interests, skills, and goals:</p>
        
        <div className="career-recommendations">
          {recommendations.map((career, index) => (
            <div key={career.career_id} className="career-card">
              <div className="career-header">
                <h3>{career.career_name}</h3>
                <span className="match-score">{career.match_score}% match</span>
              </div>
              <p>{career.description}</p>
              
              <div className="career-details">
                <div className="skills-section">
                  <h4>Skills to be learned:</h4>
                  <p>{career.required_skills.slice(0, 5).join(', ')}</p>
                </div>
                
                {career.career_type_weights && (
                  <div className="weights-section">
                    <h4>Recommendation Based On:</h4>
                    <ul>
                      <li>RIASEC Assessment: {career.career_type_weights.riasec}%</li>
                      <li>Your Skills: {career.career_type_weights.skills}%</li>
                      <li>Your Behavior: {career.career_type_weights.behavior}%</li>
                      <li>Your Goals: {career.career_type_weights.goals}%</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <button 
                className="btn select-career-btn"
                onClick={() => handleCareerSelect(career)}
              >
                Choose This Career Path
              </button>
            </div>
          ))}
        </div>
        
        <button className="btn" onClick={handleRetake} style={{ marginTop: '20px' }}>
          Retake Assessment
        </button>
      </div>
    );
  }

  if (selectedCareer) {
    return (
      <div className="riasec-assessment confirmation">
        <h2>Career Selected!</h2>
        <div className="confirmation-card">
          <h3>You've chosen: {selectedCareer.career_name}</h3>
          <p>Your personalized career path has been set. You'll now receive tasks and goals tailored to this career.</p>
          <button 
            className="btn"
            onClick={() => {
              if (onCompletion) {
                onCompletion(selectedCareer);
              }
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show one question at a time
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="riasec-assessment">
      <div className="assessment-header">
        <h2>Comprehensive Career Assessment</h2>
        <p>Answer all {questions.length} questions to discover your ideal career path.</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="assessment-content">
        <div className="questions">
          {currentQuestion && (
            <div key={currentQuestion.id} className="question-container">
              <div className="assessment-header">
                <h2 className="assessment-title">{currentQuestion.text}</h2>
              </div>

              <div className="question-options">
                {currentQuestion.options.map((option) => (
                  <label key={option.value} className={`option-button ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      className="radio-input"
                      value={option.value}
                      checked={answers[currentQuestion.id] == option.value}
                      onChange={(e) => {
                        handleAnswerChange(currentQuestion.id, parseInt(e.target.value));
                        // Auto-advance to next question after a short delay
                        setTimeout(() => {
                          if (currentQuestionIndex < questions.length - 1) {
                            handleNextQuestion();
                          }
                        }, 300);
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="assessment-navigation">
            <button 
              className="btn btn-secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{ marginRight: '10px' }}
            >
              Previous
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button 
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion.id]}
              >
                Next
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length !== questions.length}
              >
                {submitting ? "Processing..." : "Get Career Recommendations"}
              </button>
            )}
          </div>
          
          {Object.keys(answers).length > 0 && (
            <div className="answered-count">
              Answered: {Object.keys(answers).length} of {questions.length} questions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RIASECAssessment;