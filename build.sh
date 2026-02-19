#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Build the React frontend
cd frontend
npm install
npm run build
cd ..
