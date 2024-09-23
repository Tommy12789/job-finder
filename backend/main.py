from shlex import quote
import requests
from bs4 import BeautifulSoup
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app) 
# Store the latest job offers globally
latest_job_offers = []

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./backend/jobfinder-5739c-firebase-adminsdk-i3z04-d82584d2c9.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore DB
db = firestore.client()

def get_page(url, config, retries=3, delay=1):
    """Fetch the page content from the given URL with retries."""
    for _ in range(retries):
        try:
            response = requests.get(url, headers=config['headers'], timeout=5)
            if response.status_code == 200:
                return BeautifulSoup(response.content, 'html.parser')
            else:
                print(f"Failed to retrieve page. Status code: {response.status_code}")
                return None
        except requests.exceptions.Timeout:
            print("Timeout error")
        except Exception as e:
            print(f"An error occurred: {e}")
    return None

def parse_jobs_from_page(config):
    """Parse job offers from LinkedIn pages based on the search queries in config."""
    all_job_offers = []
    for query in config['search_queries']:
        keywords = quote(query['keywords'])  # URL encode the keywords
        location = quote(query['location'])  # URL encode the location

        for page_num in range(config['pages_to_scrape']):
            # Build the URL for scraping
            url = (f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
                   f"keywords={keywords}&location={location}&f_TPR=&f_WT={query['experience_level']}"
                   f"&geoId=&f_TPR={config['timespan']}&start={25 * page_num}")
            
            soup = get_page(url, config)
            if soup:
                jobs = parse_job_details(soup)
                all_job_offers.extend(jobs)
                print(f"Finished scraping page: {url}")
            time.sleep(1)

    print(f"Total job cards scraped: {len(all_job_offers)}")
    return all_job_offers

def parse_job_details(soup):
    """Parse the individual job details from the soup object."""
    joblist = []
    if not soup:
        return joblist

    try:
        divs = soup.find_all('div', class_='base-search-card__info')
    except Exception as e:
        print(f"Error parsing job details: {e}")
        return joblist

    for item in divs:
        try:
            title = item.find('h3').text.strip()
            company = item.find('a', class_='hidden-nested-link')
            location = item.find('span', class_='job-search-card__location')
            parent_div = item.parent
            entity_urn = parent_div['data-entity-urn']
            job_posting_id = entity_urn.split(':')[-1]
            job_url = f'https://www.linkedin.com/jobs/view/{job_posting_id}/'
            date_tag = item.find('time', class_='job-search-card__listdate') or \
                       item.find('time', class_='job-search-card__listdate--new')
            date = date_tag['datetime'] if date_tag else ''

            job = {
                'title': title,
                'company': company.text.strip().replace('\n', ' ') if company else '',
                'location': location.text.strip() if location else '',
                'date': date,
                'job_url': job_url,
                'job_description': '',
                'applied': 0,
                'hidden': 0,
                'interview': 0,
                'rejected': 0
            }
            joblist.append(job)
        except Exception as e:
            print(f"Error parsing a job card: {e}")

    return joblist

def parse_job_description(desc_soup):
    """Extract and clean the job description from the given soup object."""
    if not desc_soup:
        return "Could not find Job Description"

    div = desc_soup.find('div', class_='description__text description__text--rich')
    if not div:
        return "Could not find Job Description"
    
    # Clean and format the job description
    for element in div.find_all(['span', 'a']):
        element.decompose()

    for ul in div.find_all('ul'):
        for li in ul.find_all('li'):
            li.insert(0, '-')

    text = div.get_text(separator='\n').strip()
    text = text.replace('\n\n', '').replace('::marker', '-').replace('-\n', '- ')
    text = text.replace('Show less', '').replace('Show more', '')

    return text

def get_job_description(job, config):
    """Fetch and parse the job description for a specific job."""
    desc_soup = get_page(job['job_url'], config)
    return parse_job_description(desc_soup)

@app.route("/offers", methods=['POST'])
def get_offers():
    """Endpoint to scrape and return job offers based on the provided search config."""
    global latest_job_offers
    try:
        config = request.get_json()
        print(config)

        if not config or 'search_queries' not in config or not isinstance(config['search_queries'], list):
            return jsonify({"error": "Invalid configuration"}), 400

        latest_job_offers = parse_jobs_from_page(config)

        for job in latest_job_offers:
            job['job_description'] = get_job_description(job, config)

        if not latest_job_offers:
            return jsonify({"message": "No job offers found"}), 404

        return jsonify(latest_job_offers), 200  # Renvoie directement les offres d'emploi

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/offers/latest", methods=['GET'])
def get_latest_offers():
    """Endpoint to retrieve the latest scraped job offers."""
    if latest_job_offers:
        return jsonify(latest_job_offers), 200
    else:
        return jsonify({"message": "No job offers available"}), 404
    
@app.route('/auth/register', methods=['POST'])
def register_user():
    try:
        # Get the user data from the request
        user_data = request.get_json()

        # Check if the user already exists in Firestore by email
        user_ref = db.collection('users').where('email', '==', user_data['email']).stream()
        existing_user = None
        for doc in user_ref:
            existing_user = doc.to_dict()

        if existing_user:
            print(f"User with email {user_data['email']} already exists.")
            return jsonify({"message": "Utilisateur déjà enregistré"}), 200

        # Create new user in Firestore
        new_user = {
            'nom': user_data.get('family_name', ''),
            'prenom': user_data.get('given_name', ''),
            'email': user_data.get('email', '')
        }

        # Add new user to Firestore
        db.collection('users').add(new_user)
        print(f"User with email {user_data['email']} successfully registered.")
        
        return jsonify({"message": "Utilisateur enregistré avec succès"}), 201

    except Exception as e:
        print(f"Error registering user: {e}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
