from flask import Flask, render_template, request, jsonify
import json
import requests

app = Flask(__name__, template_folder='templates', static_folder='static')

# --- Gemini API Configuration ---
# NOTE: In a real production app, the API key should be stored securely
# and not hardcoded. For this example, it is left as an empty string.
GEMINI_API_KEY = ""
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={GEMINI_API_KEY}"


def get_saving_tips_from_gemini(bill_data):
    """Calls the Gemini API to get energy-saving tips."""
    
    # Extract data from the frontend request
    amount = bill_data.get('amount')
    units = bill_data.get('units')
    tariff = bill_data.get('tariff')

    if not all([amount, units, tariff]):
        return ["Error: Missing data for tip generation."]

    # Construct a detailed prompt for the Gemini API
    prompt = f"""
    Based on the following electricity usage, generate 3 concise and actionable energy-saving tips.
    The user is on a '{tariff}' tariff, consumed {units} kWh, and their estimated bill is {amount}.
    The tips should be practical for a user in this category.
    """
    
    # Define the desired JSON output structure for the model
    json_schema = {
        "type": "OBJECT",
        "properties": {
            "tips": {
                "type": "ARRAY",
                "items": {
                    "type": "STRING",
                    "description": "A single, actionable energy-saving tip."
                }
            }
        },
        "required": ["tips"]
    }

    # Create the payload for the Gemini API
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": json_schema
        }
    }

    try:
        response = requests.post(GEMINI_API_URL, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
        # Safely parse the JSON response
        result = response.json()
        
        # Extract the text content containing the JSON string
        json_text = result['candidates'][0]['content']['parts'][0]['text']
        
        # Parse the JSON string to get the tips
        tips_data = json.loads(json_text)
        
        return tips_data.get("tips", ["Could not generate tips at this time."])

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return ["Sorry, we couldn't fetch saving tips right now. Please check the connection."]
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"Error parsing Gemini response: {e}")
        return ["Sorry, there was an issue processing the tips from the AI."]


# --- Existing Routes ---

@app.route('/')
def signin():
    return render_template('signin.html')

@app.route('/home')
def home():
    return render_template('index.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

# --- API Routes ---

@app.route('/predict', methods=['POST'])
def predict():
    """Handles the prediction form submission."""
    try:
        units = float(request.form['units_consumed'])
        energy_rate = float(request.form['energy_charge'])
        fixed = float(request.form['fixed_charges'])
        duty_percent = float(request.form['electricity_duty'])
        
        base_charge = units * energy_rate
        duty_amount = base_charge * (duty_percent / 100)
        total_bill = base_charge + fixed + duty_amount
        
        prediction_data = {
            'predicted_amount': f'₹{total_bill:,.2f}',
            'raw_amount': total_bill,
            'raw_units': units,
            'tariff': request.form['tariff_category'],
            'breakdown': {
                'load': f"{request.form['sanctioned_load']} kW",
                'units': f"{units} kWh",
                'energy': f"₹{base_charge:,.2f}",
                'fixed': f"₹{fixed:,.2f}",
                'duty': f"₹{duty_amount:,.2f} ({duty_percent}%)"
            }
        }
        return jsonify(prediction_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# NEW ROUTE for Gemini API Feature
@app.route('/get-tips', methods=['POST'])
def get_tips():
    """Receives prediction data and returns AI-generated saving tips."""
    bill_data = request.json
    tips = get_saving_tips_from_gemini(bill_data)
    return jsonify({'tips': tips})


if __name__ == '__main__':
    app.run(debug=True)

#updated app 
