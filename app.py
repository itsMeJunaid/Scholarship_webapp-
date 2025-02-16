from flask import Flask, render_template, redirect, url_for, session, flash, request
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import logging
from flask_migrate import Migrate
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)  # Store hashed passwords

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
# Fetch API keys from a GitHub raw URL
response = requests.get("https://raw.githubusercontent.com/itsMeJunaid/programingwithjunaidkhan/refs/heads/main/keys.json")
if response.status_code == 200:
    try:
        keys = response.json()
        JOOBLE_API_KEY = keys.get("jooble")
    except ValueError:
        logger.error("Error parsing JSON from keys file")
        JOOBLE_API_KEY = None
else:
    logger.error(f"Failed to fetch API keys, status code: {response.status_code}")
    JOOBLE_API_KEY = None  # Handle the error as needed

def fetch_data_from_jooble(keywords, location):
    """Fetch data from Jooble API (can be used for both jobs and scholarships)"""
    if not JOOBLE_API_KEY:
        logger.error("Jooble API key is missing or invalid.")
        return []
    
    try:
        url = f"https://jooble.org/api/{JOOBLE_API_KEY}"
        params = {
            "keywords": keywords,
            "location": location
        }
        
        response = requests.post(url, json=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        results = data.get('jobs', [])
        
        # Enhance data with additional fields if needed
        for item in results:
            item['posted_date'] = datetime.now().strftime("%Y-%m-%d")
            item['apply_url'] = item.get('link', '#')
            item['snippet'] = item.get('snippet', '').strip()
        
        return results
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from Jooble: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_data_from_jooble: {str(e)}")
        return []
    

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/scholarships', methods=['GET'])
def get_scholarships():
    try:
        keywords = request.args.get('keywords', 'College Fund')
        location = request.args.get('location', '')
        
        scholarships = fetch_data_from_jooble(keywords, location)
        return jsonify(scholarships)
    except Exception as e:
        logger.error(f"Error in get_scholarships: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        keywords = request.args.get('keywords', '')
        location = request.args.get('location', '')
        
        if not keywords:
            return jsonify([])
        
        jobs = fetch_data_from_jooble(keywords, location)
        return jsonify(jobs)
    except Exception as e:
        logger.error(f"Error in get_jobs: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/api/internships', methods=['GET'])  # Plural "internships" to match frontend
def internship():
    try:
        keywords = request.args.get('keywords', '')
        location = request.args.get('location', '')

        if not keywords:
            return jsonify([])

        intern_ship = fetch_data_from_jooble(keywords, location)
        return jsonify(intern_ship)
    except Exception as e:
        logger.error(f"Error in internship: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

    

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login_signup'))

@app.route('/login_signup', methods=['GET', 'POST'])
def login_signup():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'login':
            email = request.form['email']
            password = request.form['password']
            user = User.query.filter_by(email=email).first()
            
            if user and check_password_hash(user.password, password):
                session['user_id'] = user.id
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid login details.', 'danger')
        
        elif action == 'signup':
            username = request.form['username']
            email = request.form['email']
            password = request.form['password']
            
            # Check if email or username already exists
            if User.query.filter_by(email=email).first():
                flash('User with this email already exists.', 'danger')
            elif User.query.filter_by(username=username).first():
                flash('Username already taken.', 'danger')
            else:
                hashed_password = generate_password_hash(password)
                new_user = User(username=username, email=email, password=hashed_password)
                db.session.add(new_user)
                db.session.commit()
                flash('Registration successful. Please log in.', 'success')
                return redirect(url_for('login_signup'))
    
    return render_template('login_signup.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login_signup'))
    user = User.query.get(session['user_id'])
    return render_template('dashboard.html', user=user)

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login_signup'))
    
    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        new_username = request.form['username']
        full_name = request.form['full_name']
        new_password = request.form['new_password']
        
        # Check for unique username
        if User.query.filter(User.username == new_username, User.id != user.id).first():
            flash('Username already taken.', 'danger')
            return redirect(url_for('profile'))

        # Update user details
        user.username = new_username
        user.full_name = full_name
        if new_password:  # Only update password if a new one is provided
            user.password = generate_password_hash(new_password)
        
        db.session.commit()
        flash('Profile updated successfully.', 'success')
        return redirect(url_for('profile'))
    
    return render_template('profile.html', user=user)

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/bot')
def bot():
    return render_template('bot.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)