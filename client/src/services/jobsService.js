class JobsService {
  async getJobs(filters = {}) {
    // In a real implementation, this would fetch jobs from the backend
    // based on the provided filters
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return [
      {
        id: 1,
        title: "Frontend Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$90,000 - $120,000",
        description: "We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React and modern web technologies.",
        requirements: ["3+ years of React experience", "JavaScript proficiency", "CSS/HTML expertise"],
        posted: "2025-10-10",
        applicants: 24
      },
      {
        id: 2,
        title: "Data Scientist",
        company: "DataInsights Inc.",
        location: "New York, NY",
        type: "Full-time",
        salary: "$110,000 - $140,000",
        description: "Join our data science team to build predictive models and extract insights from large datasets.",
        requirements: ["Python proficiency", "Machine Learning experience", "Statistics background"],
        posted: "2025-10-11",
        applicants: 18
      },
      {
        id: 3,
        title: "UX Designer",
        company: "Creative Solutions",
        location: "Remote",
        type: "Contract",
        salary: "$70 - $90/hr",
        description: "Create beautiful and intuitive user experiences for our web and mobile applications.",
        requirements: ["Figma proficiency", "User research experience", "Portfolio required"],
        posted: "2025-10-12",
        applicants: 32
      },
      {
        id: 4,
        title: "Backend Engineer",
        company: "StartupXYZ",
        location: "Austin, TX",
        type: "Full-time",
        salary: "$100,000 - $130,000",
        description: "Develop and maintain our backend services and APIs using Node.js and PostgreSQL.",
        requirements: ["Node.js experience", "Database design", "API development"],
        posted: "2025-10-09",
        applicants: 41
      }
    ];
  }

  async applyForJob(jobId, applicationData) {
    // In a real implementation, this would submit the job application to the backend
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      success: true,
      message: "Application submitted successfully!"
    };
  }

  async searchJobs(query) {
    // In a real implementation, this would search jobs based on the query
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response - in a real app, this would filter jobs based on the query
    return this.getJobs();
  }
}

export default new JobsService();