# Use the official Python image as a base
FROM python:3.12.8-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the application files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose the port the app runs on
EXPOSE 8080

# Run the Flask app
CMD [ "gunicorn", "-b", "0.0.0.0:8080", "server:app" ]