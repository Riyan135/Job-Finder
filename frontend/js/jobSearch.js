// frontend/js/jobSearch.js

// Utility to build query parameters from filter inputs
function buildJobFilters() {
  const keyword = document.querySelector('input[placeholder="Job title, skill, or company..."]')?.value.trim();
  const location = document.querySelector('input[placeholder="City, state, or remote..."]')?.value.trim();
  const minSalary = document.getElementById('salaryRange')?.value;
  const jobType = document.querySelector('select')?.value;

  const filters = {};
  if (keyword) filters.keyword = keyword;
  if (location) filters.location = location;
  if (minSalary && Number(minSalary) > 0) filters.salary = minSalary;
  if (jobType && jobType !== 'All Types') filters.type = jobType;
  return filters;
}

// Render a single job card into the grid
function renderJobCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card glass-panel';
  card.innerHTML = `
    <div class="job-card-header">
      <div class="company-logo" style="background:${job.company && job.company.color ? job.company.color : '#4f46e5'};">
        ${job.company && job.company.name ? job.company.name.charAt(0).toUpperCase() : 'C'}
      </div>
      <div class="job-info">
        <h4>${job.title}</h4>
        <div class="company-name">${job.company && job.company.name ? job.company.name : 'Company'}</div>
        <div class="match-badge ${job.skillMatchPercentage >= 80 ? 'high' : job.skillMatchPercentage >= 50 ? 'medium' : 'low'}">
          ${job.skillMatchPercentage ? job.skillMatchPercentage + '% Match' : ''}
        </div>
      </div>
    </div>
    <div class="job-meta">
      <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
      <span><i class="fas fa-dollar-sign"></i> ${job.salary ? job.salary + ' LPA' : 'Negotiable'}</span>
      <span><i class="fas fa-briefcase"></i> ${job.jobType || 'Full-time'}</span>
    </div>
    <div class="skill-tags">
      ${(job.requiredSkills || []).slice(0, 4).map(skill => `
        <span class="skill-tag tag-${skill.toLowerCase().replace(/\s+/g, '-')}">${skill}</span>`
      ).join('')}
    </div>
    <div class="job-card-actions">
      <button class="btn-apply" onclick="openApplyModal('${job._id}', '${job.company && job.company.name ? job.company.name.replace(/'/g, "\\'") : (typeof job.company === 'string' ? job.company.replace(/'/g, "\\'") : '')}', '${job.company && job.company.email ? job.company.email : ''}')"><i class="fas fa-paper-plane"></i> Apply Now</button>
      <button class="btn-save" onclick="saveJob('${job._id}')"><i class="fas fa-bookmark"></i> Save</button>
    </div>
  `;
  return card;
}

// Main fetch function used by the page
async function fetchJobs() {
  const grid = document.getElementById('jobGrid');
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;">
    <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i>
    <p>Loading jobs...</p>
  </div>`;
  try {
    const filters = buildJobFilters();
    const response = await API.getJobs(filters);
    const jobs = response.data || [];
    grid.innerHTML = '';
    if (jobs.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;">
        <p>No jobs found matching your criteria.</p>
      </div>`;
      document.getElementById('resultCount').textContent = '0';
      return;
    }
    document.getElementById('resultCount').textContent = jobs.length;
    jobs.forEach(job => {
      const card = renderJobCard(job);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:red;">
        Failed to load jobs. Please try again later.
      </div>`;
  }
}

// Export for potential external use (optional)
// Export for potential external use (optional)
// export { fetchJobs };
window.fetchJobs = fetchJobs;
