from shlex import quote
import requests
from bs4 import BeautifulSoup
import time
import json

def load_config(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def get_page(url, config, retries=3, delay=1):
    for i in range(retries):
        try:
            response = requests.get(url, headers=config['headers'], timeout=5)
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"An error occurred: {e}")
            time.sleep(delay)
        except requests.exceptions.Timeout:
            print("Timeout error")
            time.sleep(delay)
    return None

def parse_jobs_from_page(config):
    all_job_offers = []
    for query in config['search_queries']:
        keywords = quote(query['keywords']) # URL encode the keywords
        location = quote(query['location']) # URL encode the location
        for i in range (0, config['pages_to_scrape']):
                url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={keywords}&location={location}&f_TPR=&f_WT={query['experience_level']}&geoId=&f_TPR={config['timespan']}&start={25*i}"
                soup = get_page(url, config)
                jobs = parse_job_details(soup)
                all_job_offers = all_job_offers + jobs
                print("Finished scraping page: ", url)
    print ("Total job cards scraped: ", len(all_job_offers))
    return all_job_offers

def parse_job_details(soup):
    # Parsing the job card info (title, company, location, date, job_url) from the beautiful soup object
    joblist = []
    try:
        divs = soup.find_all('div', class_='base-search-card__info')
    except:
        print("Empty page, no jobs found")
        return joblist
    for item in divs:
        title = item.find('h3').text.strip()
        company = item.find('a', class_='hidden-nested-link')
        location = item.find('span', class_='job-search-card__location')
        parent_div = item.parent
        entity_urn = parent_div['data-entity-urn']
        job_posting_id = entity_urn.split(':')[-1]
        job_url = 'https://www.linkedin.com/jobs/view/'+job_posting_id+'/'

        date_tag_new = item.find('time', class_ = 'job-search-card__listdate--new')
        date_tag = item.find('time', class_='job-search-card__listdate')
        date = date_tag['datetime'] if date_tag else date_tag_new['datetime'] if date_tag_new else ''
        job_description = ''
        job = {
            'title': title,
            'company': company.text.strip().replace('\n', ' ') if company else '',
            'location': location.text.strip() if location else '',
            'date': date,
            'job_url': job_url,
            'job_description': job_description,
            'applied': 0,
            'hidden': 0,
            'interview': 0,
            'rejected': 0
        }
        joblist.append(job)
        print(f"Job: {job['title']}, {job['company']}, {job['location']}, {job['date']}, {job['job_url']}")

    return joblist

def main():
    config_file = './backend/config_example.json'
    config_load = load_config(config_file) 
    parse_jobs_from_page(config_load)

main()
 
