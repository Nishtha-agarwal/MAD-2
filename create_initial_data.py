from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import  db
 
def create_data(user_datastore):
    print('### creating data ###')

    # create roles
    user_datastore.find_or_create_role(name='admin',  description = "Administraton")
    user_datastore.find_or_create_role(name='pro',  description = "Service Professional")
    user_datastore.find_or_create_role(name='cus',  description = "Customers")

    #create user data 
    if not user_datastore.find_user(email = "admin@iitm.ac.in"):
        user_datastore.create_user(email = "admin@iitm.ac.in", password=hash_password('admin'), roles=['admin'])
    
    db.session.commit()
    