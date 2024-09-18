from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import json

db = SQLAlchemy()

app = Flask(__name__)

with open('./backend/config_example.json') as config_file:
    config = json.load(config_file)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql://{config['database']['user']}:{config['database']['password']}"
    f"@{config['database']['host']}:{config['database']['port']}/{config['database']['db_name']}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    prenom = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f"<User {self.prenom} {self.nom}>"

with app.app_context():
    new_user = User(nom="Doe", prenom="John")
    db.session.add(new_user)
    db.session.commit()
    print(f"Utilisateur ajouté : {new_user}")