#!/bin/bash

#create the virtual enviroment venv
python3 -m venv venv

#activate the virtual environment
source venv/bin/activate

pip install django
pip install djangorestframework
pip install psycopg2-binary
# pip install djangorestframework_simplejwt
# pip install django-cors-headers

pip install django-watchman
pip install django-cors-headers
pip install django-prometheus
