#!/usr/bin/env python3
"""
Startup script for the Semantic Similarity Analyzer.
This script handles dependencies and starts the Flask application.
"""

import sys
import subprocess
import os

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)

def install_dependencies():
    """Install required dependencies."""
    print("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        sys.exit(1)

def check_dependencies():
    """Check if required packages are installed."""
    required_packages = [
        'flask', 'sentence_transformers', 'numpy', 'scikit-learn'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Installing missing dependencies...")
        install_dependencies()

def main():
    """Main startup function."""
    print("=== Semantic Similarity Analyzer ===")
    print("Starting up...\n")
    
    # Check Python version
    check_python_version()
    
    # Check dependencies
    check_dependencies()
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("Note: No .env file found. OpenAI embeddings will not be available.")
        print("To enable OpenAI embeddings, create a .env file with your API key.")
        print("See env_example.txt for reference.\n")
    
    # Start the Flask application
    print("Starting Flask application...")
    print("The application will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server.\n")
    
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 