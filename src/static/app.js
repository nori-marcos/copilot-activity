document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Fetch and display activities
  async function loadActivities() {
    try {
      const response = await fetch('/activities');
      const activities = await response.json();
      
      const activitiesList = document.getElementById('activities-list');
      const activitySelect = document.getElementById('activity');
      
      // Clear loading message
      activitiesList.innerHTML = '';
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      
      // Display each activity
      for (const [name, details] of Object.entries(activities)) {
        // Create activity card
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        const participantsCount = details.participants.length;
        const spotsLeft = details.max_participants - participantsCount;
        
        // Build participants list HTML
        let participantsHTML = '';
        if (details.participants.length > 0) {
          const participantsList = details.participants
            .map(email => `<li>${email}</li>`)
            .join('');
          participantsHTML = `
            <div class="participants">
              <h5>Participants (${participantsCount}/${details.max_participants}):</h5>
              <ul>${participantsList}</ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants">
              <h5>Participants (0/${details.max_participants}):</h5>
              <ul><li class="no-participants">No participants yet. Be the first to sign up!</li></ul>
            </div>
          `;
        }
        
        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Spots Available:</strong> ${spotsLeft} of ${details.max_participants}</p>
          ${participantsHTML}
        `;
        
        activitiesList.appendChild(card);
        
        // Add to select dropdown
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      }
    } catch (error) {
      document.getElementById('activities-list').innerHTML = 
        '<p class="error">Error loading activities. Please try again later.</p>';
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        messageDiv.className = "message success";
        messageDiv.textContent = data.message;
        messageDiv.classList.remove("hidden");

        // Reset form and reload activities
        signupForm.reset();
        loadActivities();
      } else {
        throw new Error(data.detail || "Signup failed");
      }
    } catch (error) {
      messageDiv.className = "message error";
      messageDiv.textContent = error.message;
      messageDiv.classList.remove("hidden");
    }

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  });

  // Load activities when page loads
  loadActivities();
});
