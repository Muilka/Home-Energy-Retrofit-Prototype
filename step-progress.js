// Unified Progress Bar Management System - Used to manage multi-step process progress display for different user profiles
class StepProgressManager {
  constructor() {
    // Get user profile information from local storage (A, B, C, D four types)
    this.userProfile = sessionStorage.getItem('userProfile');
    // Get step configuration information corresponding to different user profiles
    this.stepConfigs = this.getStepConfigs();
  }

  // Get step configurations for each user profile - Define process steps corresponding to different user types
  getStepConfigs() {
    return {
      // Type A users: 4 steps (Property Information -> Improvement Measures -> Contractor Selection -> Project Completion)
      'A': [
        { number: 1, title: 'Property Information', page: 'step1-property-info.html' },
        { number: 2, title: 'Improvement Measures', page: 'step2-improvement-measures.html' },
        { number: 3, title: 'Contractor Selection', page: 'contractor-selection.html' },
        { number: 4, title: 'Project Completion', page: 'completion.html' }
      ],
      // Type B users: 6 steps (including bank information and loan selection)
      'B': [
        { number: 1, title: 'Property Information', page: 'step1-property-info.html' },
        { number: 2, title: 'Improvement Measures', page: 'step2-improvement-measures.html' },
        { number: 3, title: 'Bank Information', page: 'bank-info.html' },
        { number: 4, title: 'Loan Selection', page: 'loan-selection.html' },
        { number: 5, title: 'Contractor Selection', page: 'contractor-selection.html' },
        { number: 6, title: 'Project Completion', page: 'completion.html' }
      ],
      // Type C users: 6 steps (including benefit information and benefit selection)
      'C': [
        { number: 1, title: 'Property Information', page: 'step1-property-info.html' },
        { number: 2, title: 'Improvement Measures', page: 'step2-improvement-measures.html' },
        { number: 3, title: 'Benefit Information', page: 'welfare-info.html' },
        { number: 4, title: 'Benefit Selection', page: 'welfare-selection.html' },
        { number: 5, title: 'Contractor Selection', page: 'contractor-selection.html' },
        { number: 6, title: 'Project Completion', page: 'completion.html' }
      ],
      // Type D users: 8 steps (including benefit information, benefit selection, bank information and loan selection)
      'D': [
        { number: 1, title: 'Property Information', page: 'step1-property-info.html' },
        { number: 2, title: 'Improvement Measures', page: 'step2-improvement-measures.html' },
        { number: 3, title: 'Benefit Information', page: 'welfare-info.html' },
        { number: 4, title: 'Benefit Selection', page: 'welfare-selection.html' },
        { number: 5, title: 'Bank Information', page: 'bank-info.html' },
        { number: 6, title: 'Loan Selection', page: 'loan-selection.html' },
        { number: 7, title: 'Contractor Selection', page: 'contractor-selection.html' },
        { number: 8, title: 'Project Completion', page: 'completion.html' }
      ]
    };
  }

  // Generate progress bar HTML - Generate visual progress bar based on current user profile and page status
  generateStepIndicator() {
    // Get step configuration corresponding to current user profile
    const steps = this.stepConfigs[this.userProfile] || [];
    // Get current page filename
    const currentFileName = window.location.pathname.split('/').pop();
    // Start building progress bar HTML
    let html = '<div class="step-indicator">';
    
    // Iterate through each step to generate corresponding progress bar elements
    steps.forEach((step, index) => {
      // Determine if it's the current step
      const isCurrentStep = step.page === currentFileName;
      // Determine if this step is completed
      const isCompletedStep = this.isStepCompleted(step.page);
      
      // Set CSS class name for step circle
      let circleClass = 'step-circle';
      if (isCurrentStep) circleClass += ' active';        // Add active class for current step
      else if (isCompletedStep) circleClass += ' completed'; // Add completed class for completed steps
      
      // Generate HTML for step circle and title
      html += `<div class="step-item"><div class="${circleClass}">${step.number}</div><div class="step-title">${step.title}</div></div>`;
      
      // No longer add step-bar horizontal line
    });
    
    html += '</div>';
    return html;
  }

  // Determine if step is completed - By comparing step order
  isStepCompleted(pageName) {
    // Get step configuration for current user profile
    const stepOrder = this.stepConfigs[this.userProfile] || [];
    // Find the index position of current page in step configuration
    const currentStepIndex = stepOrder.findIndex(step => step.page === window.location.pathname.split('/').pop());
    // Find the index position of target page in step configuration
    const targetStepIndex = stepOrder.findIndex(step => step.page === pageName);
    
    // If target step index is less than current step index, it means target step is completed
    return targetStepIndex < currentStepIndex;
  }

  // Initialize progress bar - Called when page loads, insert generated progress bar HTML into page
  init() {
    // Find progress bar container element in page
    const stepIndicatorContainer = document.querySelector('.step-indicator, #stepIndicator');
    if (stepIndicatorContainer) {
      // Insert generated progress bar HTML into container
      stepIndicatorContainer.innerHTML = this.generateStepIndicator();
    }
  }

  // Get next page - Determine which page to navigate to next based on current page and user profile
  getNextPage() {
    // Get step configuration for current user profile
    const steps = this.stepConfigs[this.userProfile] || [];
    // Get current page filename
    const currentFileName = window.location.pathname.split('/').pop();
    // Find the index position of current page in step configuration
    const currentStepIndex = steps.findIndex(step => step.page === currentFileName);
    
    // If current step exists and is not the last step, return the next page
    if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
      return steps[currentStepIndex + 1].page;
    }
    
    // If there's no next step, return null
    return null;
  }

  // Get previous page - Determine which page to navigate to previous based on current page and user profile
  getPreviousPage() {
    // Get step configuration for current user profile
    const steps = this.stepConfigs[this.userProfile] || [];
    // Get current page filename
    const currentFileName = window.location.pathname.split('/').pop();
    // Find the index position of current page in step configuration
    const currentStepIndex = steps.findIndex(step => step.page === currentFileName);
    
    // If current step is not the first step, return the previous page
    if (currentStepIndex > 0) {
      return steps[currentStepIndex - 1].page;
    }
    
    // If there's no previous step, return null
    return null;
  }


}

// Global instance variable - Used to access progress bar manager in pages
let stepProgressManager;

// Initialize when page loads - Automatically create progress bar manager instance and initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create progress bar manager instance
  stepProgressManager = new StepProgressManager();
  // Initialize progress bar display
  stepProgressManager.init();
});

// Export for use by other scripts - Mount class and manager instance to global window object for easy access by other scripts
window.StepProgressManager = StepProgressManager;
window.stepProgressManager = stepProgressManager; 