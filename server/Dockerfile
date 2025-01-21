# Use the official Python image as a base
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the application files
COPY requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
pip install --no-cache-dir --prefer-binary -r /app/requirements.txt && \
pip install --no-cache-dir torch==2.5.1+cpu --index-url https://download.pytorch.org/whl/cpu

RUN pip cache purge

COPY . /app
# Expose the port the app runs on
EXPOSE 8080

# Run the Flask app
CMD [ "gunicorn", "-b", "0.0.0.0:8080", "server:app" ]