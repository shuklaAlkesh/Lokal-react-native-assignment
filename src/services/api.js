import axios from 'axios';

const BASE_URL = 'https://testapi.getlokalapp.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchJobs = async (page = 1) => {
  try {
    console.log('Fetching jobs for page:', page);
    const response = await api.get(`/common/jobs?page=${page}`);
    console.log('Raw API response:', response);

    if (!response.data || !response.data.results) {
      throw new Error('No data received from the server');
    }

    return {
      data: response.data.results.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.primary_details?.Place || 'Location not specified',
        salary: job.primary_details?.Salary || `₹${job.salary_min} - ₹${job.salary_max}`,
        phone: job.whatsapp_no || 'Phone not available',
        description: job.other_details || 'No description available',
        requirements: job.contentV3?.V3?.find(item => item.field_key === 'Other details')?.field_value || 'No requirements specified',
        type: job.job_hours || 'Full time',
        experience: job.primary_details?.Experience || 'Experience not specified',
        jobType: job.primary_details?.Job_Type || 'Not specified',
        qualification: job.primary_details?.Qualification || 'Not specified',
        vacancies: job.openings_count || 0,
        company: job.company_name,
        createdOn: job.created_on,
        updatedOn: job.updated_on,
        jobCategory: job.job_category,
        jobRole: job.job_role,
        image: job.creatives?.[0]?.file,
        tags: job.job_tags || [],
        contactPreference: job.contact_preference || {},
      }))
    };
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Server error');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error('Failed to fetch jobs. Please try again.');
    }
  }
}; 