import pytest
from flask import Flask
from main import app, parse_job_details, get_page, parse_jobs_from_page
from bs4 import BeautifulSoup
from unittest.mock import patch, MagicMock

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_offers_invalid_config(client):
    response = client.post('/offers', json={})
    assert response.status_code == 400
    assert b'Invalid configuration' in response.data

@patch('main.parse_jobs_from_page')
@patch('main.get_job_description')
def test_get_offers_valid_config(mock_get_job_description, mock_parse_jobs_from_page, client):
    mock_parse_jobs_from_page.return_value = [{'title': 'Test Job'}]
    mock_get_job_description.return_value = 'Test description'
    
    response = client.post('/offers', json={
        'search_queries': [{'keywords': 'python', 'location': 'New York', 'experience_level': '2'}],
        'pages_to_scrape': 1,
        'timespan': '24h'
    })
    
    assert response.status_code == 200
    assert b'Test Job' in response.data
    assert b'Test description' in response.data

def test_parse_job_details():
    html = '''
    <div class="base-card__full-link">
        <div class="base-search-card__info">
            <h3 class="base-search-card__title">Test Job</h3>
            <h4 class="base-search-card__subtitle">
                <a class="hidden-nested-link">Test Company</a>
            </h4>
            <div class="job-search-card__location">Test Location</div>
        </div>
    </div>
    '''
    soup = BeautifulSoup(html, 'html.parser')
    jobs = parse_job_details(soup)
    assert len(jobs) == 1
    assert jobs[0]['title'] == 'Test Job'
    assert jobs[0]['company'] == 'Test Company'
    assert jobs[0]['location'] == 'Test Location'

@patch('main.get_page')
def test_parse_jobs_from_page(mock_get_page):
    mock_html = '''
    <div class="base-card__full-link">
        <div class="base-search-card__info">
            <h3 class="base-search-card__title">Test Job</h3>
            <h4 class="base-search-card__subtitle">
                <a class="hidden-nested-link">Test Company</a>
            </h4>
            <div class="job-search-card__location">Test Location</div>
        </div>
    </div>
    '''
    mock_get_page.return_value = BeautifulSoup(mock_html, 'html.parser')
    config = {
        'search_queries': [{'keywords': 'python', 'location': 'New York', 'experience_level': '2'}],
        'pages_to_scrape': 1,
        'timespan': '24h',
        'headers': {}
    }
    stop_event = MagicMock()
    stop_event.is_set.return_value = False
    
    jobs = list(parse_jobs_from_page(config, stop_event))
    assert len(jobs) == 1
    assert jobs[0]['title'] == 'Test Job'
    assert jobs[0]['company'] == 'Test Company'
    assert jobs[0]['location'] == 'Test Location'

# Add more tests for other functions and routes