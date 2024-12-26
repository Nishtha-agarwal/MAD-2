from flask import Flask, jsonify, render_template, flash, session, request, send_file
from flask_security import current_user, SQLAlchemyUserDatastore, hash_password, roles_accepted, auth_required
from flask_security.utils import hash_password, verify_password
from extensions import db
from model import Customer, Professional, Service, ServiceRequest
import datetime
from tasks import add, generate_report_for_customer, send_customer_daily_report, export_closed_request_task
from celery.result import AsyncResult
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from celery.utils.log import get_task_logger
import os

logger = get_task_logger(__name__)

def create_view(app:Flask, user_datastore:SQLAlchemyUserDatastore, cache):
    
    @app.route('/')
    def home():
        return render_template('index.html')

    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        new_user = user_datastore.create_user(
            email=email,
            password=hash_password(password),
            roles=[role], 
            active=True
        )
        db.session.add(new_user)
        db.session.commit()
        
        try:
            # Handle registration based on role
            if role == 'pro':
                new_professional = Professional(
                    name=data.get('name'),
                    email=email,
                    password=hash_password(password),
                    service_type=data.get('service_type'),  # Ensure these are provided
                    experience=data.get('experience'),      # Ensure these are provided
                    location=data.get('location'),
                    mobile_no=data.get('mobile_no')
                )
                db.session.add(new_professional)
                db.session.commit()
                return jsonify({"message": "Professional registered successfully!"}), 201

            elif role == 'cus':
                new_customer = Customer(
                    name=data.get('name'),
                    email=email,
                    password=hash_password(password),
                    location=data.get('location'),
                    mobile_no=data.get('mobile_no')
                )
                db.session.add(new_customer)
                db.session.commit()
                return jsonify({"message": "Customer registered successfully!"}), 201
        except Exception as e:
            db.session.rollback()
            print(f'Error while creating user: {e}')
            return jsonify({'message': 'Error while creating user'}), 500
        return jsonify({'message': 'Unexpected error occurred'}), 501

    @app.route('/profile_pro', methods=['GET', 'POST'])
    @cache.cached(timeout=5)
    def profile_pro():
        email = session.get('email')
        professional = Professional.query.filter_by(email=email).first()
        if request.method == 'GET':
            # Handle GET request to fetch profile data
            pro = {
                "email": professional.email,
                "name": professional.name,
                "service_type": professional.service_type,
                "experience": professional.experience,
                "location": professional.location,
                "mobile_no": professional.mobile_no
            }   
            return jsonify(pro), 200
        if request.method == 'POST':
            # Handle POST request to update profile data
            data = request.get_json()
            professional.service_type = data.get("service_type")
            professional.experience = data.get("experience")
            professional.location = data.get("location")
            professional.mobile_no = data.get("mobile_no")  
            db.session.commit()
            return jsonify({"message": "Profile updated successfully!"}), 200

    @app.route('/profile_cus', methods=['GET', 'POST'])
    @cache.cached(timeout=5)
    def profile_cus():
        email = session.get('email')
        customer = Customer.query.filter_by(email=email).first()
        if request.method == 'GET':
            # Handle GET request to fetch profile data
            cus = {
                "email": customer.email,
                "name": customer.name,
                "location": customer.location,
                "mobile_no": customer.mobile_no
            }   
            return jsonify(cus), 200
        if request.method == 'POST':
            # Handle POST request to update profile data
            data = request.get_json()
            customer.location = data.get("location")
            customer.mobile_no = data.get("mobile_no")  
            db.session.commit()
            return jsonify({"message": "Profile updated successfully!"}), 200

    @app.route('/cus-login', methods=['POST'])
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'message' : 'not valid email or password'}), 404        
        
        user1 = Customer.query.filter_by(email=email).first()
        if user1 and user1.is_active :  
            session['email'] = user1.email  
            return jsonify({
                "message": "Logged in successfully",
                "token": "sample_token",   # Generate or retrieve a token
                "role": "cus",             # Assign the user's role
                "email": user1.email,
                "id": user1.id             # Assuming Customer model has an `id`
            }), 200
            
        
        user2 = Professional.query.filter_by(email=email).first()
        if user2 and user2.is_active :  
            session['email'] = user2.email  
            return jsonify({
                "message": "Logged in successfully",
                "token": "sample_token",   # Generate or retrieve a token
                "role": "pro",             # Assign the user's role
                "email": user2.email,
                "id": user2.id             # Assuming Customer model has an `id`
            }), 200
            
        user = user_datastore.find_user(email=email)
        if user:
            session['email'] = email
            return jsonify({
                "message": "Logged in successfully",
                "role": "admin",
                "email": user.email,
                "id": user.id,
                "token": "sample_token"  # Replace with real token generation logic
            }), 200
            
        return jsonify({"message": "Invalid credentials"}), 401

    @app.route('/add_services', methods=['GET','POST'])
    @cache.cached(timeout=5)
    def add_service():
        if request.method == 'POST':
            if request.is_json:
                data = request.get_json()
                
                # Validate input data
                name = data.get('name')
                price = data.get('price')
                time_required = data.get('time_required')
                description = data.get('description')
                
                new_service = Service(name=name, price=price, time_required=time_required, description=description)
                db.session.add(new_service)
                db.session.commit()
            
                return jsonify({
                    "success" : True, 
                    "message": "New service added successfully",
                    "redirect_url" : "/ad_dash"
                    }), 201

    @app.route('/api/services', methods=['GET'])
    @cache.cached(timeout=5)
    def search_services_get():
        search_term = request.args.get('name', '').strip()
        if search_term:
            services = Service.query.filter(Service.name.ilike(f'%{search_term}%')).all()
        else:
            services = Service.query.all()
        services_data = [{'name': service.name, 'price': service.price, 'time_required':service.time_required, 'description':service.description} for service in services]
        return jsonify(services_data), 200
    
    @app.route('/delete_service/<string:service_name>', methods=['DELETE'])
    @cache.cached(timeout=5)
    def delete_service(service_name):
        service = Service.query.filter_by(name=service_name).first()
        if not service:
            return jsonify({"success": False, "message": "Service not found"}), 404
        db.session.delete(service)
        db.session.commit()
        return jsonify({"success": True, "message": "Service deleted successfully"}), 200

    @app.route('/edit_service/<string:service_name>', methods=['PUT'])
    @cache.cached(timeout=5)
    def edit_service(service_name):
        if request.is_json:
            data = request.get_json()
            service = Service.query.filter_by(name=service_name).first()
            if not service:
                return jsonify({"success": False, "message": "Service not found"}), 404
        
        # Update service details
            service.name = data.get('name', service.name)
            service.price = data.get('price', service.price)
            service.time_required = data.get('time_required', service.time_required)
            service.description = data.get('description', service.description)
            db.session.commit()
            return jsonify({"success": True, "message": "Service updated successfully"}), 200
        return jsonify({"success": False, "message": "Invalid input"}), 400

    @app.route('/api/services', methods=['POST'])
    @cache.cached(timeout=5)
    def search_services():
        data = request.get_json()
        search_term = data.get('name', '').strip() if data else ''
        try:
            if search_term:
                services = Service.query.filter(Service.name.ilike(f'%{search_term}%')).all()
            else:
                services = Service.query.all()
            services_data = [
                {
                    'name': service.name,
                    'price': service.price,
                    'time_required': service.time_required,
                    'description': service.description
                }
                for service in services
            ]
            return jsonify(services_data), 200
        except:
            return jsonify({"error": f"An internal error occurred"}), 500
        
    @app.route('/api/request_service', methods=['POST'])
    def request_service():
        try:
            data = request.get_json()
        # Extract the data from the request
            service_name = data.get('service_name')
            customer_id = data.get('customer_id')
            professional_id = data.get('professional_id')
            service_status = data.get('service_status')
            description = data.get('description')

        # Create a new ServiceRequest record
            service_request = ServiceRequest(
                service_name=service_name,
                customer_id=customer_id,
                professional_id=professional_id,
                service_status=service_status,
                description=description,
            )
            db.session.add(service_request)
            db.session.commit()

            return jsonify({"message": "Service request created successfully."}), 201
        except Exception as e:
            return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500
     
    @app.route('/ad_dash', methods=['POST'])
    def ad_dash_service():
        try:
            services = Service.query.all()
            services_data = [
                {
                    'name': service.name,
                    'price': service.price,
                    'time_required': service.time_required,
                    'description': service.description
                }
                for service in services
            ]
            return ({'data' : services_data}), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch service data"}), 500

    @app.route('/ad_dash_professionals', methods=['POST'])
    @cache.cached(timeout=5)
    def ad_dash_pro():
        try:
            professionals = Professional.query.all()
            pro_data = [
                {
                'name': pro.name,
                'email': pro.email,
                'service_type': pro.service_type,
                'experience': pro.experience,
                'location': pro.location,
                'mobile_no': pro.mobile_no,
                'is_active': pro.is_active  # Include the `is_active` field for frontend logic
                } for pro in professionals
            ]
            return jsonify({'data': pro_data}), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch pro data"}), 500

    @app.route('/ad_dash_customers', methods=['POST'])
    @cache.cached(timeout=5)
    def ad_dash_cus():
        try:
            customers = Customer.query.all()
            cus_data = [
                {
                'name': cus.name,
                'email': cus.email,
                'location': cus.location,
                'mobile_no': cus.mobile_no,
                'is_active': cus.is_active  # Include the `is_active` field for frontend logic
                } for cus in customers
            ]
            return jsonify({'data': cus_data}), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch customers data"}), 500

    @app.route('/ad_dash_service_request', methods=['POST'])
    @cache.cached(timeout=5)
    def ad_dash_sr():
        srs = ServiceRequest.query.all()
        sr_data = [
            {
                'service_name': sr.service_name,
                'customer_id': sr.customer_id,
                'professional_id': sr.professional_id,
                'service_status': sr.service_status,
            } for sr in srs
        ]
        return jsonify({'data': sr_data}), 200
        
    @app.route('/delete_service_request/<string:service_name>', methods=['DELETE'])
    @cache.cached(timeout=5)
    def delete_servicerequest(service_name):
        servicer = ServiceRequest.query.filter_by(service_name=service_name).first()
        if not servicer:
            return jsonify({"success": False, "message": "Servicereq not found"}), 404
        db.session.delete(servicer)
        db.session.commit()
        return jsonify({"success": True, "message": "Servicereq deleted successfully"}), 200
   
    @app.route('/admin/approve/customer/<cus_name>', methods=['POST'])
    @cache.cached(timeout=5)
    def approve_customer_user(cus_name):
        cus = Customer.query.filter_by(name=cus_name).first()
        if cus:
            cus.is_active = True
            db.session.commit()
            flash(f"Customer {cus_name} has been approved.", "success")
        else:
            flash(f"Customer not found.", "error")
        return jsonify({"message": f"Customer {cus_name} approved successfully"}), 200

    @app.route('/api/servicerequest', methods=['GET'])
    def search_servicerequest_get():
        search_term = request.args.get('name', '').strip()
        query = ServiceRequest.query.options(joinedload(ServiceRequest.customer))
        if search_term:
            servicerequest = query.filter(ServiceRequest.service_name.ilike(f'%{search_term}%')).all()
        else:
            servicerequest = ServiceRequest.query.all()
            
        servicerequest_data = [{
            'service_name': servicerequest.service_name, 
            'customer_id': servicerequest.customer_id, 
            'professional_id':servicerequest.professional_id, 
            'date_of_request':servicerequest.date_of_request,
            'customer': {
                'name': servicerequest.customer.name,
                'location': servicerequest.customer.location,
                'mobile_no': servicerequest.customer.mobile_no
            }
        } for servicerequest in servicerequest]
        return jsonify(servicerequest_data), 200
        
    @app.route('/api/serviceadrequest', methods=['GET'])
    @cache.cached(timeout=5)
    def searchad_serviceradequest_get():
        search_term = request.args.get('name', '').strip()
        query = ServiceRequest.query
        
        if search_term:
            query = query.filter(ServiceRequest.service_name.ilike(f'%{search_term}%'))
        servicerequest = query.all()
            
        servicerequest_data = [
            {
                'service_name': sr.service_name,
                'customer_id': sr.customer_id,
                'professional_id': sr.professional_id,
                'date_of_request': sr.date_of_request,
                'service_status': sr.service_status,  
            } for sr in servicerequest
        ]
        return jsonify(servicerequest_data), 200  
      
    @app.route('/api/counts', methods=['GET'])
    def get_counts():
        professional_count = db.session.query(func.count(Professional.id)).scalar()
        customer_count = db.session.query(func.count(Customer.id)).scalar()
        service_request_counts = db.session.query(
            ServiceRequest.service_status, func.count(ServiceRequest.id)
            ).group_by(ServiceRequest.service_status).all()

        service_request_status_counts = {status: count for status, count in service_request_counts}
        return jsonify({
            'professional_count': professional_count,
            'customer_count': customer_count,
            'service_request_status_counts': service_request_status_counts
        }), 200  
      
    @app.route('/api/pendingservices', methods=['GET'])
    @cache.cached(timeout=5)
    def get_pending_services():
        query = ServiceRequest.query.options(joinedload(ServiceRequest.customer))
        pending_services = query.filter_by(service_status="Pending").all()
        pending_service_data = [
            {
                "id": servicer.id,
                "service_name": servicer.service_name,
                "customer_id": servicer.customer_id,
                'customer': {
                    'name': servicer.customer.name,
                    'mobile_no': servicer.customer.mobile_no,
                    'location': servicer.customer.location
                }
            } for servicer in pending_services
        ]
        return jsonify(pending_service_data), 200
    
    @app.route('/api/closedservices', methods=['GET'])
    def get_closed_services():
        closed_services = ServiceRequest.query.filter_by(service_status="Completed").all()
        closed_services_data = [
            {
                "service_name" : service.service_name,
                "customer_id": service.customer_id,
                "mobile_no": service.customer.mobile_no,
                "location": service.customer.location,
                "service_status" : service.service_status,
            }
            for service in closed_services
        ]
        return jsonify(closed_services_data)

    @app.route('/api/update_action', methods=['POST'])
    @cache.cached(timeout=5)
    def update_action():
        data = request.json
        id = data.get("id")
        service_status = data.get("service_status") 
        print(f"{data}")
        
        servicer = ServiceRequest.query.filter_by(id=id).first()
        
        if servicer.service_status == "Pending":
            servicer.service_status = service_status
            db.session.commit()
            return jsonify({"message": f"Service {service_status} successfully!"}), 200
        else:
            return jsonify({"message": "Service not in pending state."}), 401

    @app.route('/api/servicerequestcus', methods=['GET', 'POST'])
    @cache.cached(timeout=5)
    def get_cusservicerequest():
        if request.method == "POST":
            data = request.json
            service_name = data.get("service_name")
            service_status = data.get("service_status")
            
            service = ServiceRequest.query.filter_by(service_name=service_name).first()
            if not service:
                return jsonify({"error": "Service not found"}), 404
        
            if service.service_status == "Accepted":
                service.service_status = service_status
                db.session.commit()
                return jsonify({"message": f"Service {service_status} successfully!"}), 200
            else:
                return jsonify({"error": "Service cannot be updated as it's not in 'Accepted' state."}), 400 

        elif request.method == "GET":
            # Handle GET logic to fetch service requests
            query = ServiceRequest.query.options(
                joinedload(ServiceRequest.professional),  # Load Professional relationship
                joinedload(ServiceRequest.service)        # Load Service relationship
            )
            services = query.filter(ServiceRequest.service_status.in_(["Accepted"])).all()
        
            services_data = [
                {
                    "service_name": servicereq.service_name,
                    'professional': {
                        'name': servicereq.professional.name,
                        'mobile_no': servicereq.professional.mobile_no
                    }
                } for servicereq in services
            ]
            return jsonify(services_data), 200
   
    @app.route('/api/service_request', methods=['GET'])
    def get_service_request():
        name = request.args.get('name')
        services = Service.query.filter(Service.name.ilike(f"%{name}%")).all()
        
        service_data = [
            {
                "id": service.id,
                "name": service.name,
                "price": service.price,
                "time_required": service.time_required,
                "description": service.description,
            } for service in services
        ]
    
        return jsonify(service_data), 200
    
     # cache demo
    
    @app.route('/cachedemo')
    def cacheDemo():
        return jsonify ({"time" : datetime.datetime.now()})
    
    #celery demo
    @app.route('/celery_demo')
    def celery_demo():
        task = add.delay(10, 25)
        return jsonify({'task_id' : task.id })
    
    @app.route('/get-task/<task_id>', methods=['GET'])
    def get_task(task_id):
        result = AsyncResult(task_id)
        if result.ready():
            return jsonify({
                'status': result.status, 
                'result' : result.result
            }), 200
        else:
            return jsonify({
                'message': 'Task not ready yet'
            }), 405
    
    @app.route('/start-closed-request-export', methods=['GET'])
    def export_closed_request():
        task = export_closed_request_task.delay()
        return jsonify({'task_id': task.id})
    
    @app.route('/get-closed-request-csv/<task_id>', methods=['GET'])
    def get_closed_request_csv(task_id):
        result = export_closed_request_task.AsyncResult(task_id)
        if result.ready():
            filepath = result.result  # Expecting the task to return the filename
            return send_file(filepath, as_attachment=True, download_name=filepath.split('/')[-1])
        else:
            return "Task not ready", 405

    @app.route('/start-daily-report', methods=['GET'])
    def start_daily_report():
        task = send_customer_daily_report.delay()
        return jsonify({'task_id': task.id})

    # Check status of customer daily report task
    @app.route('/daily-report-status/<task_id>', methods=['GET'])
    def daily_report_status(task_id):
        result = AsyncResult(task_id)
        if result.ready():
            filepath = result.result
            logger.info(f"Result of task: {filepath}")
            
            if filepath:
                logger.info(f"Task completed. File path: {filepath}")
                if os.path.exists(filepath):
                    return send_file(filepath, as_attachment=True, download_name=filepath.split('/')[-1])
                else:
                    logger.error(f"File not found: {filepath}")
                    return jsonify({'status': 'File not found'}), 404
            else:
                return jsonify({'status': 'File not generated properly'}), 400
        else:
            return jsonify({'status': 'In Progress'}), 202
 
     