import os
from os import getenv
from dotenv import load_dotenv
from flask import Flask
from extensions import db, security, cache
import views
from create_initial_data import create_data
from worker import celery_init_app
import flask_excel as excel
from flask_caching import Cache 
from celery.schedules import crontab
from tasks import daily_reminder, send_email, export_closed_request_task, send_customer_daily_report
from model import user, role
from flask_security import SQLAlchemyUserDatastore
load_dotenv()

celery_app = None

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SECRET_KEY'] = getenv('SECRET_KEY')
    app.config['SECURITY_PASSWORD_SALT'] = 'salty-password'
    app.config["DEBUG"] = True
    
    # configure token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600 #1hr
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

    # cache config
    app.config["DEBUG"]= True         # some Flask specific configs
    app.config["CACHE_TYPE"]= "RedisCache"  
    app.config["CACHE_DEFAULT_TIMEOUT"]= 300 
    app.config['CACHE_REDIS_PORT'] = 6379
    
    db.init_app(app)
    
    excel.init_excel(app)
    cache.init_app(app)
    
    user_datastore = SQLAlchemyUserDatastore(db, user, role) 
    security.init_app(app, user_datastore)

    with app.app_context():
        db.create_all()
        
        create_data(user_datastore)

    # disable CSRF security
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISHMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True

    views.create_view(app, user_datastore, cache)
    return app

app = create_app()
celery_app = celery_init_app(app)
excel.init_excel(app)

# daily reminder
@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=22, minute=20, day_of_week=3),
        daily_reminder.s('test2@mail', 'from crontab', 'content'),
    )

if __name__ == "__main__":
    app.run(debug=True)
    