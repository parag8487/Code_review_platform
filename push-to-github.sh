#!/bin/bash

echo "Initializing git repository..."
git init

echo "Adding all files..."
git add .

echo "Committing changes..."
git commit -m "Initial commit with updated README files"

echo "Adding remote origin..."
git remote add origin https://github.com/parag8487/Code_review_platform.git

echo "Pushing to GitHub..."
git push -u origin master

echo "Done!"