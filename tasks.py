from celery import shared_task
from model import Customer, ServiceRequest
from mail_service import send_email
import time
import csv
import os
from datetime import datetime
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

def get_closed_requests():
    # Replace with ORM query
    return []

def generate_report_for_customer(customer):
    return f"Daily report for {customer.name}"

def send_email_to_customer(email, report):
    logger.info(f"Sending email to {email} with report: {report}")

# Tasks
@shared_task
def add(x, y):
    time.sleep(15)
    return x + y

@shared_task(ignore_result=True)
def daily_reminder(to, sub, message):
    send_email(to, sub, message)
    logger.info(f"Sent daily reminder to {to}")
    return "OK"

@shared_task
def export_closed_request_task():
    try:
        os.makedirs('./user-downloads', exist_ok=True) 
        filename = f'closed_requests_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        filepath = f'./user-downloads/{filename}'

        with open(filepath, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Service ID", "Customer ID", "Professional ID", "Date of Request"])
            
            closed_requests = ServiceRequest.query.filter_by(service_status="Completed").all()
            for request in closed_requests:
                writer.writerow([
                    request.service_name,
                    request.customer_id,
                    request.professional_id,
                    request.date_of_request,
                ])
        return filepath

    except Exception as e:
        raise e

@shared_task
def send_customer_daily_report():
    try:
        os.makedirs('./user-downloads', exist_ok=True)  
        filename = f'customer_reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        filepath = f'./user-downloads/{filename}'
        
        with open(filepath, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Name", "Email", "Location", "Mobile No"])
            customers = Customer.query.all()
            for customer in customers:
                writer.writerow([
                    customer.name, 
                    customer.email, 
                    customer.location, 
                    customer.mobile_no
                ])

        logger.info("Customer daily reports sent successfully.")
        return filepath
    
    except Exception as e:
        logger.error(f"Error sending customer daily reports: {e}")
        raise e
    