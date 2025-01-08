FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

# Expose the desired port
EXPOSE 8001

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
# Command to run makemigrations, migrate, and start the server
# CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8001"]
