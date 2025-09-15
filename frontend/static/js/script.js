document.addEventListener('DOMContentLoaded', () => {
    
    // --- State variable to hold prediction data for the Gemini API call ---
    let lastPredictionData = null;

    // --- Logic for the Prediction Form on the Home Page ---
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        const resultsSection = document.getElementById('results-section');
        const tipsContainer = document.getElementById('tips-container');
        const tipsList = document.getElementById('tips-list');

        predictionForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(predictionForm);

            // Hide previous tips when a new prediction is made
            tipsContainer.classList.add('hidden');
            tipsList.innerHTML = ''; // Clear old tips

            fetch('/predict', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }

                // Store data for the Gemini API
                lastPredictionData = {
                    amount: data.predicted_amount,
                    units: data.raw_units,
                    tariff: data.tariff
                };

                // Update UI with prediction data
                document.getElementById('predicted-amount').textContent = data.predicted_amount;
                document.getElementById('breakdown-tariff').textContent = data.tariff;
                document.getElementById('breakdown-load').textContent = data.breakdown.load;
                document.getElementById('breakdown-units').textContent = data.breakdown.units;
                document.getElementById('breakdown-energy').textContent = data.breakdown.energy;
                document.getElementById('breakdown-fixed').textContent = data.breakdown.fixed;
                document.getElementById('breakdown-duty').textContent = data.breakdown.duty;

                resultsSection.classList.remove('hidden');
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while getting the prediction.');
            });
        });
    }

    // --- Logic for the Gemini "Get Tips" Button ---
    const getTipsBtn = document.getElementById('get-tips-btn');
    if (getTipsBtn) {
        const tipsContainer = document.getElementById('tips-container');
        const tipsLoader = document.getElementById('tips-loader');
        const tipsList = document.getElementById('tips-list');

        getTipsBtn.addEventListener('click', () => {
            if (!lastPredictionData) {
                alert('Please make a prediction first!');
                return;
            }

            // Show the container and loader, hide the old list
            tipsContainer.classList.remove('hidden');
            tipsLoader.style.display = 'block';
            tipsList.classList.add('hidden');
            tipsList.innerHTML = ''; // Clear previous tips

            fetch('/get-tips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lastPredictionData)
            })
            .then(response => response.json())
            .then(data => {
                tipsLoader.style.display = 'none'; // Hide loader
                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }

                // Create and append list items for each tip
                data.tips.forEach(tipText => {
                    const li = document.createElement('li');
                    li.textContent = `💡 ${tipText}`;
                    li.classList.add('bg-[#1c2327]', 'p-4', 'rounded-lg', 'border', 'border-[#3b4b54]');
                    tipsList.appendChild(li);
                });

                tipsList.classList.remove('hidden'); // Show the list
            })
            .catch(error => {
                console.error('Error fetching tips:', error);
                tipsLoader.style.display = 'none';
                alert('An error occurred while fetching saving tips.');
            });
        });
    }

    // --- Logic for Sign Up Form Validation ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        const email = document.getElementById('email-address');
        const password = document.getElementById('password');
        const passwordConfirm = document.getElementById('password-confirm');

        const validateField = (field, condition) => {
            if (condition) {
                field.classList.add('valid');
                field.classList.remove('invalid');
            } else {
                field.classList.add('invalid');
                field.classList.remove('valid');
            }
        };

        email.addEventListener('input', () => {
            const isValid = email.value.includes('@') && email.value.includes('.') && email.value.length > 5;
            validateField(email, isValid);
        });

        password.addEventListener('input', () => {
            const isValid = password.value.length >= 8;
            validateField(password, isValid);
            // Also validate the confirm password field whenever the main password changes
            const isConfirmValid = password.value === passwordConfirm.value && passwordConfirm.value.length > 0;
            validateField(passwordConfirm, isConfirmValid);
        });

        passwordConfirm.addEventListener('input', () => {
            const isValid = password.value === passwordConfirm.value && passwordConfirm.value.length > 0;
            validateField(passwordConfirm, isValid);
        });
    }
    
    // --- Logic for Password Visibility Toggle on ALL Auth Pages ---
    const passwordToggles = document.querySelectorAll('.password-toggle');
    if (passwordToggles.length > 0) {
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent form submission
                // Find the input field within the same parent container
                const passwordInput = toggle.closest('.relative').querySelector('input');
                if (passwordInput && (passwordInput.type === 'password' || passwordInput.type === 'text')) {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        toggle.textContent = 'visibility_off';
                    } else {
                        passwordInput.type = 'password';
                        toggle.textContent = 'visibility';
                    }
                }
            });
        });
    }
});

