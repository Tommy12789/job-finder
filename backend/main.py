from shlex import quote
import requests
from bs4 import BeautifulSoup
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import fitz

app = Flask(__name__)
CORS(app)
latest_job_offers = []
favorites = []

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./backend/jobfinder-5739c-firebase-adminsdk-i3z04-d82584d2c9.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore DB
db = firestore.client()

def get_page(url, config, retries=3, delay=1):
    """Fetch the page content from the given URL with retries."""
    time.sleep(delay)
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

            logo_img = parent_div.find('img', class_='artdeco-entity-image')
            logo_url = logo_img['data-delayed-url'] if logo_img else ''

            job = {
                'title': title,
                'company': company.text.strip().replace('\n', ' ') if company else '',
                'location': location.text.strip() if location else '',
                'date': date,
                'job_url': job_url,
                'job_description': '',
                'company_logo': logo_url, 
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
    
@app.route('/add-favorite', methods=['POST'])
def add_favorite():
    try:
        user_email = request.json.get('email')
        job_offer = request.json.get('jobOffer')

        if not user_email or not job_offer:
            return jsonify({"error": "Données manquantes"}), 400

        user_ref = db.collection('users').document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            favorites = user_data.get('favorites', [])

            if job_offer not in favorites:
                favorites.append(job_offer)
                user_ref.update({'favorites': favorites})
                return jsonify({"message": "Favori ajouté avec succès"}), 200
            else:
                return jsonify({"message": "Cette offre est déjà dans les favoris"}), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error adding favorite: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-favorites', methods=['POST'])
def get_favorites():
    try:
        user_email = request.json.get('email')

        if not user_email:
            return jsonify({"error": "Email est requis"}), 400

        # Récupérer la référence de l'utilisateur dans Firestore
        user_ref = db.collection('users').document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            favorites = user_data.get('favorites', [])
            return jsonify(favorites), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error retrieving favorites: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-resume-text', methods=['POST'])
def get_resume_text():
    try:
        user_email = request.json.get('email')

        if not user_email:
            return jsonify({"error": "Email est requis"}), 400

        # Récupérer la référence de l'utilisateur dans Firestore
        user_ref = db.collection('users').document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            resume_text = user_data.get('resume_text', '')
            return jsonify({"resume_text": resume_text}), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error retrieving resume text: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/resume-upload', methods=['POST'])
def upload_resume():
    try:
        user_email = request.form.get('email')
        resume = request.files.get('resume')

        if not user_email or not resume:
            return jsonify({"error": "Données manquantes"}), 400

        pdf_text = extract_text_from_pdf(resume)
        print(f"Resume text extracted: {pdf_text[:500]}...")  # Debugging output

        user_ref = db.collection('users').document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_ref.update({'resume_text': pdf_text})
            return jsonify({"message": "CV téléchargé et profil mis à jour avec succès", "text": pdf_text}), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error uploading resume: {e}")
        return jsonify({"error": str(e)}), 500



def extract_text_from_pdf(pdf_file):
    """Function to extract text from an uploaded PDF using PyMuPDF (fitz)."""
    try:
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
        text = ""
        
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text += page.get_text("text")
        
        doc.close()
        print(f"Extracted text: {text[:500]}...")  # Print a snippet of the extracted text for debugging
        return text if text.strip() else "No text found in the PDF."

    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return "Error extracting text from the PDF."





@app.route('/remove-favorite', methods=['POST'])
def remove_favorite():
    try:
        user_email = request.json.get('email')
        job_offer = request.json.get('jobOffer')

        if not user_email or not job_offer:
            return jsonify({"error": "Données manquantes"}), 400

        # Récupérer la référence de l'utilisateur dans Firestore
        user_ref = db.collection('users').document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            favorites = user_data.get('favorites', [])

            # Vérifier si l'offre est dans les favoris
            updated_favorites = [fav for fav in favorites if fav['title'] != job_offer['title']]
            user_ref.update({'favorites': updated_favorites})

            return jsonify({"message": "Favori supprimé avec succès"}), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error removing favorite: {e}")
        return jsonify({"error": str(e)}), 500

    
@app.route('/auth/register', methods=['POST'])
def register_user():
    try:
        user_data = request.get_json()

        if not user_data.get('email'):
            return jsonify({"error": "Email est requis"}), 400

        # Rechercher l'utilisateur par email
        user_ref = db.collection('users').document(user_data['email'])
        user_doc = user_ref.get()

        if user_doc.exists:
            return jsonify({"message": "Utilisateur déjà enregistré"}), 200

        # Créer un nouveau document utilisateur
        new_user = {
            'nom': user_data.get('family_name', ''),
            'prenom': user_data.get('given_name', ''),
            'email': user_data.get('email', ''),
            'favorites': [] 
        }

        user_ref.set(new_user)
        return jsonify({"message": "Utilisateur enregistré avec succès"}), 201

    except Exception as e:
        print(f"Error registering user: {e}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
