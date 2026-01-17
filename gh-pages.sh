#!/bin/bash

# Deploy build directory to GitHub Pages
# This keeps the build directory out of main branch

set -e  # Exit on error

pnpm run build

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Clean up any existing gh-pages directory
rm -rf gh-pages

# Clone the repository into gh-pages subdirectory
git clone git@github.com:wwf971/react-comp-misc.git gh-pages
cd gh-pages

# Create and switch to gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# Copy built files from parent build directory
cp -r ../build/* .

# Get the latest commit SHA from main branch
cd ..
COMMIT_SHA=$(git rev-parse HEAD)
cd gh-pages

# Commit and push with commit SHA in message
git add .
git commit -m "pages built from ${COMMIT_SHA}"
git push -f origin gh-pages

# Clean up - go back to project root
cd ..
rm -rf gh-pages

echo "✓ Deployment complete!"
echo "Pages built from commit: ${COMMIT_SHA}"
echo "Site will be available at: https://wwf971.github.io/react-comp-misc/"



# useful commands
  # delete gh-pages branch
    # git push origin --delete gh-pages
  # delete local gh-pages branch
    # git branch -D gh-pages