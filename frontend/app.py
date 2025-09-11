from flask import Flask, render_template

# Initialize the Flask application
app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def home():
    """
    Renders the main page of the application.
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Runs the app in debug mode for development
    app.run(debug=True)