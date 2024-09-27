from shlex import quote
import requests
from bs4 import BeautifulSoup
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import fitz
from openai import OpenAI
import os
from dotenv import load_dotenv
from datetime import datetime
import random

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


app = Flask(__name__)
CORS(app)
latest_job_offers = []
favorites = []

cred = credentials.Certificate(
    "./backend/jobfinder-5739c-firebase-adminsdk-i3z04-d82584d2c9.json"
)
firebase_admin.initialize_app(cred)

# Initialize Firestore DB
db = firestore.client()


def get_page(url, config, max_retries=5, base_delay=1, max_delay=60):
    """Fetch the page content from the given URL with retries and exponential backoff."""
    headers = config["headers"]

    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                print(f"Page retrieved successfully: {url}")
                return BeautifulSoup(response.content, "html.parser")

            elif response.status_code == 429:
                print(
                    f"Rate limit exceeded (attempt {attempt + 1}/{max_retries}). Retrying after delay..."
                )

                # Calculate delay with exponential backoff and jitter
                delay = min(base_delay * (2**attempt) + random.uniform(0, 1), max_delay)
                time.sleep(delay)

            else:
                print(f"Failed to retrieve page. Status code: {response.status_code}")
                return None

        except requests.exceptions.RequestException as e:
            print(f"An error occurred (attempt {attempt + 1}/{max_retries}): {e}")

            # Calculate delay with exponential backoff and jitter
            delay = min(base_delay * (2**attempt) + random.uniform(0, 1), max_delay)
            time.sleep(delay)

    print(f"Failed to retrieve page after {max_retries} attempts: {url}")
    return None


def parse_jobs_from_page(config):
    """Parse job offers from LinkedIn pages based on the search queries in config."""
    all_job_offers = []
    for query in config["search_queries"]:
        keywords = quote(query["keywords"])
        location = quote(query["location"])

        for page_num in range(config["pages_to_scrape"]):
            url = (
                f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
                f"keywords={keywords}&location={location}&f_TPR=&f_E={query['experience_level']}"
                f"&geoId=&f_TPR={config['timespan']}&start={10 * page_num}"
            )

            soup = get_page(url, config)
            if soup:
                jobs = parse_job_details(soup)
                all_job_offers.extend(jobs)

            # Add a delay between requests to different pages
            time.sleep(random.uniform(2, 5))

    print(f"Total job cards scraped: {len(all_job_offers)}")
    return all_job_offers


def parse_job_details(soup):
    """Parse the individual job details from the soup object."""
    joblist = []
    if not soup:
        return joblist

    try:
        divs = soup.find_all("div", class_="base-search-card__info")
    except Exception as e:
        print(f"Error parsing job details: {e}")
        return joblist

    for item in divs:
        try:
            title = item.find("h3").text.strip()
            company = item.find("a", class_="hidden-nested-link")
            location = item.find("span", class_="job-search-card__location")
            parent_div = item.parent
            entity_urn = parent_div["data-entity-urn"]
            job_posting_id = entity_urn.split(":")[-1]
            job_url = f"https://www.linkedin.com/jobs/view/{job_posting_id}/"
            date_tag = item.find(
                "time", class_="job-search-card__listdate"
            ) or item.find("time", class_="job-search-card__listdate--new")
            date = date_tag["datetime"] if date_tag else ""

            logo_img = parent_div.find("img", class_="artdeco-entity-image")
            logo_url = logo_img["data-delayed-url"] if logo_img else ""

            job = {
                "title": title,
                "company": company.text.strip().replace("\n", " ") if company else "",
                "location": location.text.strip() if location else "",
                "date": date,
                "job_url": job_url,
                "job_description": "",
                "company_logo": logo_url,
                "cover_letter": "",
                "status": "",
            }
            joblist.append(job)
        except Exception as e:
            print(f"Error parsing a job card: {e}")

    return joblist


def parse_job_description(desc_soup):
    """Extract and clean the job description from the given soup object."""
    if not desc_soup:
        return "Could not find Job Description"

    div = desc_soup.find("div", class_="description__text description__text--rich")
    if not div:
        return "Could not find Job Description"

    for element in div.find_all(["span", "a"]):
        element.decompose()

    for ul in div.find_all("ul"):
        for li in ul.find_all("li"):
            li.string = f"- {li.get_text(strip=True)}"

    # Clean up text content and prettify
    html_content = div.prettify()  # Retain the HTML structure for rendering

    # Remove "Show less" and "Show more" text
    html_content = (
        html_content.replace("Show less", "")
        .replace("Show more", "")
        .replace("<br/>", "")
    )

    # Add newlines after certain closing tags to improve readability
    tags_to_break_after = [
        "</p>",
        "</li>",
        "</ul>",
        "</h2>",
        "</h3>",
        "</strong>",
        "</em>",
    ]

    # Insert newlines after specified tags
    for tag in tags_to_break_after:
        html_content = html_content.replace(tag, tag + "\n")

    # Remove any excessive or extra newlines created accidentally
    html_content = "\n".join(
        [line for line in html_content.splitlines() if line.strip()]
    )

    return html_content


def get_job_description(job, config):
    """Fetch and parse the job description for a specific job."""
    desc_soup = get_page(job["job_url"], config)
    return parse_job_description(desc_soup)


@app.route("/offers", methods=["POST"])
def get_offers():
    """Endpoint to scrape and return job offers based on the provided search config."""
    global latest_job_offers
    try:
        config = request.get_json()
        print(config)

        if (
            not config
            or "search_queries" not in config
            or not isinstance(config["search_queries"], list)
        ):
            return jsonify({"error": "Invalid configuration"}), 400

        latest_job_offers = parse_jobs_from_page(config)

        for job in latest_job_offers:
            job["job_description"] = get_job_description(job, config)

        if not latest_job_offers:
            return jsonify({"message": "No job offers found"}), 404

        return (
            jsonify(latest_job_offers),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/offers/latest", methods=["GET"])
def get_latest_offers():
    """Endpoint to retrieve the latest scraped job offers."""
    if latest_job_offers:
        return jsonify(latest_job_offers), 200
    else:
        return jsonify({"message": "No job offers available"}), 404


@app.route("/add-favorite", methods=["POST"])
def add_favorite():
    print(request.data)
    print(request.json)
    try:
        user_email = request.json.get("email")
        job_offer = request.json.get("jobOffer")

        if not user_email or not job_offer:
            return jsonify({"error": "Données manquantes"}), 400

        if not isinstance(job_offer, dict):
            return jsonify({"error": "jobOffer doit être un dictionnaire"}), 400

        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            favorites = user_data.get("favorites", [])

            # Vérifiez si job_offer est déjà dans les favoris
            if job_offer not in favorites:
                favorites.append(job_offer)
                user_ref.update({"favorites": favorites})
                return jsonify({"message": "Favori ajouté avec succès"}), 200
            else:
                return (
                    jsonify({"message": "Cette offre est déjà dans les favoris"}),
                    200,
                )
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error adding favorite: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/get-favorites", methods=["POST"])
def get_favorites():
    print(request.json)
    try:
        user_email = request.json.get("email")

        if not user_email:
            return jsonify({"error": "Email est requis"}), 400

        # Récupérer la référence de l'utilisateur dans Firestore
        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            favorites = user_data.get("favorites", [])
            print(favorites)
            return jsonify(favorites), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error retrieving favorites: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/get-resume-text", methods=["POST"])
def get_resume_text():
    try:
        user_email = request.json.get("email")

        if not user_email:
            return jsonify({"error": "Email est requis"}), 400

        # Récupérer la référence de l'utilisateur dans Firestore
        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            resume_text = user_data.get("resume_text", "")
            return jsonify({"resume_text": resume_text}), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error retrieving resume text: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/resume-upload", methods=["POST"])
def upload_resume():
    try:
        user_email = request.form.get("email")
        resume = request.files.get("resume")

        if not user_email or not resume:
            return jsonify({"error": "Données manquantes"}), 400

        pdf_text = extract_text_from_pdf(resume)
        print(f"Resume text extracted: {pdf_text[:500]}...")

        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_ref.update({"resume_text": pdf_text})
            return (
                jsonify(
                    {
                        "message": "CV téléchargé et profil mis à jour avec succès",
                        "text": pdf_text,
                    }
                ),
                200,
            )
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
        print(f"Extracted text: {text[:500]}...")
        return text if text.strip() else "No text found in the PDF."

    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return "Error extracting text from the PDF."


@app.route("/remove-favorite", methods=["POST"])
def remove_favorite():
    try:
        user_email = request.json.get("email")
        job_offer = request.json.get("jobOffer")

        if not user_email or not job_offer:
            return jsonify({"error": "Données manquantes"}), 400

        # Récupérer la référence de l'utilisateur dans Firestore
        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            favorites = user_data.get("favorites", [])

            # Vérifier si l'offre est dans les favoris
            updated_favorites = [
                fav for fav in favorites if fav["job_url"] != job_offer["job_url"]
            ]
            user_ref.update({"favorites": updated_favorites})

            return jsonify({"message": "Favori supprimé avec succès"}), 200
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error removing favorite: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/generate-cover-letter", methods=["POST"])
def generate_cover_letter():
    try:
        user_email = request.json.get("email")
        job_offer = request.json.get("jobOffer")

        print(user_email)

        if not user_email or not job_offer:
            return (
                jsonify(
                    {"error": "Email et informations de l'offre d'emploi sont requis"}
                ),
                400,
            )

        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        user_data = user_doc.to_dict()
        phone = user_data.get("phone_number", "")
        address = user_data.get("address", "")
        city = user_data.get("city", "")
        zip_code = user_data.get("zip_code", "")
        country = user_data.get("country", "")
        firstname = user_data.get("prenom", "")
        lastname = user_data.get("nom", "")
        resume_text = user_data.get("resume_text", "")

        if resume_text == "":
            return jsonify({"error": "CV non disponible"}), 400

        prompt = (
            f"Create a cover letter for a position titled '{job_offer['title']}' at "
            f"'{job_offer['company']}' based in '{job_offer['location']}'. "
            f"Here is the job description: {job_offer['job_description']}. "
            f"The candidate's resume text is as follows: {resume_text}. "
            f"The candidate personal information is as follows: {firstname}, {lastname}. "
            f"{address}, {city}, {zip_code}, {country}. "
            f"Create a professional cover letter that highlights the skills and experience."
            f"Do not include information that you do not have (no '[' or ']' and '*' and links). I do not want bold text and do not include the company address."
            f"On the top left, I want my personnal information to be included at the top the cover letter ('firstname lastname', 'address, zipcode', 'city, country', number, mail)."
            f"Then on the right write 'company name', 'city, country'"
            f"Then write the subject of the letter 'Application for the position of 'job title' at 'company name'"
            f"Then i want to write 'Dear company name hiring team' and then the body of the letter."
            f" At the end just sign with my name."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "As an HR professional, I need your assistance in crafting an exceptional cover letter",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )

        cover_letter = response.choices[0].message.content

        if user_doc.exists:
            favorites = user_data.get("favorites", [])

            # Mise à jour précise de l'offre correspondante
            for job in favorites:
                if job.get("job_url") == job_offer.get("job_url"):
                    # Met à jour uniquement cette offre avec la nouvelle lettre de motivation
                    job["cover_letter"] = cover_letter
                    break  # S'arrête dès que l'offre correspondante est trouvée

            user_ref.update({"favorites": favorites})

            return (
                jsonify(
                    {
                        "message": "Lettre de motivation générée et enregistrée avec succès",
                        "cover_letter": cover_letter,
                    }
                ),
                200,
            )
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

    except Exception as e:
        print(f"Error generating cover letter: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/auth/register", methods=["POST"])
def register_user():
    try:
        user_data = request.get_json()

        if not user_data.get("email"):
            return jsonify({"error": "Email est requis"}), 400

        user_ref = db.collection("users").document(user_data["email"])
        user_doc = user_ref.get()

        if user_doc.exists:
            return jsonify({"message": "Utilisateur déjà enregistré"}), 200

        new_user = {
            "nom": user_data.get("family_name", ""),
            "prenom": user_data.get("given_name", ""),
            "email": user_data.get("email", ""),
            "resume_text": "",
            "favorites": [],
        }

        user_ref.set(new_user)
        return jsonify({"message": "Utilisateur enregistré avec succès"}), 201

    except Exception as e:
        print(f"Error registering user: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/update-cover-letter", methods=["POST"])
def update_cover_letter():
    try:
        user_email = request.json.get("email")
        job_offer = request.json.get("jobOffer")
        cover_letter = request.json.get("coverLetter")

        if not user_email or not job_offer or not cover_letter:
            return (
                jsonify(
                    {
                        "error": "Email, informations de l'offre d'emploi et lettre de motivation sont requis"
                    }
                ),
                400,
            )

        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        user_data = user_doc.to_dict()
        favorites = user_data.get("favorites", [])

        # Mise à jour précise de l'offre correspondante
        for job in favorites:
            if job.get("job_url") == job_offer.get("job_url"):
                # Met à jour uniquement cette offre avec la nouvelle lettre de motivation
                job["cover_letter"] = cover_letter
                break  # S'arrête dès que l'offre correspondante est trouvée

        user_ref.update({"favorites": favorites})

        return (
            jsonify(
                {
                    "message": "Lettre de motivation mise à jour avec succès",
                    "cover_letter": cover_letter,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Error updating cover letter: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/update-user-data", methods=["POST"])
def update_user_data():
    data = request.get_json()
    email = data.get("email")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    phone_number = data.get("phoneNumber")
    address = data.get("address")
    zip_code = data.get("zip")
    city = data.get("city")
    country = data.get("country")

    user_ref = db.collection("users").document(email)
    user_doc = user_ref.get()

    if user_doc.exists:
        user_ref.update(
            {
                "prenom": first_name,
                "nom": last_name,
                "phone_number": phone_number,
                "address": address,
                "zip_code": zip_code,
                "city": city,
                "country": country,
            }
        )
        return (
            jsonify(
                {
                    "prenom": "Successfully updated user data for user with email: "
                    + email
                }
            ),
            200,
        )
    else:
        return jsonify({"error": "User not found"}), 404


@app.route("/get-user-data", methods=["POST"])
def get_user_data():
    data = request.get_json()
    email = data.get("email")

    user_ref = db.collection("users").document(email)
    user_doc = user_ref.get()

    if user_doc.exists:
        user_data = user_doc.to_dict()
        return (
            jsonify(
                {
                    "firstName": user_data.get("prenom", ""),
                    "lastName": user_data.get("nom", ""),
                    "phoneNumber": user_data.get("phone_number", ""),
                    "address": user_data.get("address", ""),
                    "zip": user_data.get("zip_code", ""),
                    "city": user_data.get("city", ""),
                    "country": user_data.get("country", ""),
                }
            ),
            200,
        )
    else:
        return jsonify({"error": "User not found"}), 404


@app.route("/update-application-progress", methods=["POST"])
def update_application_progress():
    try:
        user_email = request.json.get("email")
        job_offer = request.json.get("jobOffer")
        status = request.json.get("status")

        if not user_email or not job_offer or not status:
            return (
                jsonify(
                    {
                        "error": "Email, informations de l'offre d'emploi et progression sont requis"
                    }
                ),
                400,
            )

        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        user_data = user_doc.to_dict()
        favorites = user_data.get("favorites", [])

        # Mise à jour précise de l'offre correspondante
        for job in favorites:
            if job.get("job_url") == job_offer.get("job_url"):
                if job["status"] == status:
                    print("Status already updated")
                    job["status"] = ""
                    status = ""
                else:
                    job["status"] = status
                url = job["job_url"]
                break

        user_ref.update({"favorites": favorites})

        return (
            jsonify(
                {
                    "status": status,
                    "url": url,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Error updating application progress: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/add-manually-favorite", methods=["POST"])
def add_manually_favorite():
    try:
        data = request.get_json()
        email = data.get("email")
        link = data.get("link")
        print(email)
        print(link)

        if not email or not link:
            return jsonify({"error": "Email et lien de l'offre sont requis"}), 400

        # Récupération de la page de l'offre
        config = {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
            }
        }
        soup = get_page(link, config)

        with open("soup.html", "w", encoding="utf-8") as file:
            file.write(soup.prettify())

        if soup:
            # Récupération des informations principales de l'offre
            title = soup.find("h3", class_="sub-nav-cta__header").text.strip()
            print(title)
            company = soup.find("a", class_="topcard__org-name-link").text.strip()
            print(company)
            location = soup.find("span", class_="sub-nav-cta__meta-text").text.strip()
            print(location)
            date = (
                soup.find("span", class_="post-date").text.strip()
                if soup.find("span", class_="post-date")
                else datetime.now().strftime("%Y-%m-%d")
            )
            company_logo = soup.find("img", class_="artdeco-entity-image--square-5")[
                "data-delayed-url"
            ]
            print(company_logo)

            # Récupération et nettoyage de la description de l'offre
            div = soup.find("div", class_="description__text description__text--rich")
            if not div:
                return "Could not find Job Description"

            for element in div.find_all(["span", "a"]):
                element.decompose()

            for ul in div.find_all("ul"):
                for li in ul.find_all("li"):
                    li.insert(0, "-")

            text = div.get_text(separator="\n").strip()
            text = (
                text.replace("\n\n", "").replace("::marker", "-").replace("-\n", "- ")
            )
            text = text.replace("Show less", "").replace("Show more", "")

            job_description = text
            print(job_description)

            # Construction de l'objet job_offer
            job_offer = {
                "title": title,
                "company": company,
                "location": location,
                "date": date,
                "company_logo": company_logo,
                "job_url": link,
                "job_description": job_description,
                "status": "",
            }

            # Vérifier si l'utilisateur existe dans Firestore
            user_ref = db.collection("users").document(email)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                favorites = user_data.get("favorites", [])

                # Ajouter l'offre à la liste des favoris si elle n'y est pas déjà
                if job_offer not in favorites:
                    favorites.append(job_offer)
                    user_ref.update({"favorites": favorites})
                    return (
                        jsonify(
                            {
                                "message": "Favori ajouté avec succès",
                                "job_offer": job_offer,
                            }
                        ),
                        200,
                    )
                else:
                    return (
                        jsonify({"message": "Cette offre est déjà dans les favoris"}),
                        200,
                    )
            else:
                return jsonify({"error": "Utilisateur non trouvé"}), 404
        else:
            return (
                jsonify(
                    {"error": "Impossible de récupérer les informations de l'offre"}
                ),
                500,
            )

    except Exception as e:
        print(f"Error processing manually added favorite: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
