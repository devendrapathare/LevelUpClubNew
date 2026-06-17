import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CareerAssessment = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);

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

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      // Submit answers to get career recommendations
      const results = await api.submitRIASECAnswers(answers);
      setRecommendations(results.matches);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCareerSelect = async (career) => {
    setSelectedCareer(career);
    alert(`You've selected ${career.career_name} as your career path. In a real implementation, this would be saved to your profile.`);
  };

  const handleRetake = () => {
    setRecommendations(null);
    setSelectedCareer(null);
    setAnswers({});
  };

  if (!user) {
    return (
      <div className="career-assessment">
        <h2>Please log in to take the career assessment</h2>
      </div>
    );
  }

  return (
    <div className="career-assessment">
      {loading ? (
        <div className="loading-container">
          <h2>Loading Career Assessment...</h2>
          <div className="loading">Please wait while we prepare your assessment.</div>
        </div>
      ) : recommendations && !selectedCareer ? (
        <div className="results">
          <h2>Your Career Recommendations</h2>
          <p>Based on your assessment, here are the career paths that match your interests and skills:</p>
          
          <div className="career-recommendations">
            {recommendations.map((career, index) => (
              <div key={career.career_id} className="career-card">
                <div className="career-header">
                  <h3>{index + 1}. {career.career_name}</h3>
                  <span className="match-score">{career.match_score}% match</span>
                </div>
                <p>{career.description}</p>
                
                <div className="career-details">
                  <div className="skills-section">
                    <h4>Key Skills:</h4>
                    <ul>
                      {career.required_skills.slice(0, 5).map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="salary-section">
                    <h4>Salary Estimates:</h4>
                    <ul>
                      {Object.entries(career.salary_estimate || {}).map(([country, salary], idx) => (
                        <li key={idx}>{country}: {salary}</li>
                      ))}
                    </ul>
                  </div>
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
          
          <button className="btn" onClick={handleRetake}>
            Retake Assessment
          </button>
        </div>
      ) : selectedCareer ? (
        <div className="confirmation">
          <h2>Career Selected!</h2>
          <div className="confirmation-card">
            <h3>You've chosen: {selectedCareer.career_name}</h3>
            <p>Your personalized career path has been set. You'll now receive tasks and goals tailored to this career.</p>
            <button 
              className="btn"
              onClick={handleRetake}
            >
              Retake Assessment
            </button>
          </div>
        </div>
      ) : (
        <div className="assessment-content">
          <div className="assessment-header">
            <h2>RIASEC Career Assessment</h2>
            <p>Please answer all {questions.length} questions to discover your ideal career path.</p>
          </div>

          <div className="questions">
            {questions.map((question, index) => (
              <div key={question.id} className="question">
                <h3>Question {index + 1} of {questions.length}</h3>
                <p className="question-text">{question.text}</p>
                <div className="question-options">
                  {question.options.map((option) => (
                    <div key={option.value} className="option">
                      <label>
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={answers[question.id] == option.value}
                          onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                        />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="assessment-navigation">
            <button 
              className="btn"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length !== questions.length}
            >
              {submitting ? "Processing..." : "Get Career Recommendations"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAssessment;