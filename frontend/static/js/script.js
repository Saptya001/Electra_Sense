document.getElementById('billForm').addEventListener('submit', function(event) {
    // Prevent the default form submission (which reloads the page)
    event.preventDefault();

    // In a real application, you would get the form values like this:
    // const tariff = document.getElementById('tariffCategory').value;
    // const load = document.getElementById('sanctionedLoad').value;
    // And then send them to a server or use a client-side model for prediction.
    
    // For this demonstration, we'll just show the hidden result section
    const resultSection = document.getElementById('resultSection');
    const resultAmount = document.getElementById('resultAmount');

    // Set a static value as shown in the design
    resultAmount.textContent = '₹125.50';
    
    // Make the result section visible
    resultSection.style.display = 'block';
});