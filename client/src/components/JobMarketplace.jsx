import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import jobsService from '../services/jobsService';

const JobMarketplace = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobData = await jobsService.getJobs();
        setJobs(jobData);
        setFilteredJobs(jobData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const searchJobs = async () => {
      if (searchTerm) {
        try {
          const results = await jobsService.searchJobs(searchTerm);
          setFilteredJobs(results);
        } catch (error) {
          console.error("Error searching jobs:", error);
        }
      } else {
        setFilteredJobs(jobs);
      }
    };

    const delaySearch = setTimeout(() => {
      if (searchTerm !== '') {
        searchJobs();
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, jobs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit application to the jobs service
      const result = await jobsService.applyForJob(selectedJob.id, applicationData);
      alert(result.message);
      setShowApplicationForm(false);
      setSelectedJob(null);
      setApplicationData({ coverLetter: '', resume: null });
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    }
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="job-marketplace">Loading jobs...</div>;
  }

  if (showApplicationForm && selectedJob) {
    return (
      <div className="job-marketplace application-form">
        <button className="back-button" onClick={() => setShowApplicationForm(false)}>
          ← Back to Jobs
        </button>
        
        <div className="job-details">
          <h2>Apply for {selectedJob.title}</h2>
          <h3>{selectedJob.company}</h3>
          
          <form onSubmit={handleApplicationSubmit}>
            <div className="form-group">
              <label htmlFor="coverLetter">Cover Letter</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={applicationData.coverLetter}
                onChange={handleApplicationChange}
                required
                rows="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="resume">Resume</label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={(e) => setApplicationData(prev => ({
                  ...prev,
                  resume: e.target.files[0]
                }))}
                accept=".pdf,.doc,.docx"
              />
            </div>
            
            <button type="submit" className="btn">Submit Application</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="job-marketplace">
      <div className="jobs-header">
        <h2>Job Marketplace</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="jobs-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="salary">{job.salary}</span>
              </div>
              
              <div className="job-details">
                <p className="company">{job.company} • {job.location}</p>
                <p className="type">{job.type} • Posted {job.posted}</p>
                <p className="description">{job.description}</p>
                
                <div className="requirements">
                  <strong>Requirements:</strong>
                  <ul>
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="job-footer">
                <span className="applicants">{job.applicants} applicants</span>
                <button className="btn" onClick={() => handleApply(job)}>
                  Apply Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-jobs">
            <p>No jobs found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMarketplace;