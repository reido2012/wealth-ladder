#!/bin/bash

# Net Worth Planner Release Helper Script
# This script helps you create a new release by updating the version and pushing a tag

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "This is not a git repository!"
    exit 1
fi

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    print_error "Working directory is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Ask for version type or custom version
echo
echo "How would you like to update the version?"
echo "1) Patch (0.0.X) - bug fixes"
echo "2) Minor (0.X.0) - new features"
echo "3) Major (X.0.0) - breaking changes"
echo "4) Custom version"
echo

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        if [[ ! $CUSTOM_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            print_error "Invalid version format. Please use semantic versioning (e.g., 1.2.3)"
            exit 1
        fi
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Update version
if [[ -n $CUSTOM_VERSION ]]; then
    NEW_VERSION=$CUSTOM_VERSION
    npm version $CUSTOM_VERSION --no-git-tag-version
else
    NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version | sed 's/^v//')
fi

print_success "Version updated to: $NEW_VERSION"

# Ask for confirmation
echo
print_warning "This will:"
print_warning "  1. Commit the version change"
print_warning "  2. Create and push tag 'v$NEW_VERSION'"
print_warning "  3. Trigger automated build and release on GitHub"
echo

read -p "Continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    # Revert version change
    git checkout -- package.json
    print_info "Release cancelled. Version reverted."
    exit 0
fi

# Commit version change
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"
print_success "Version change committed"

# Create and push tag
git tag "v$NEW_VERSION"
print_success "Tag 'v$NEW_VERSION' created"

# Push changes and tag
git push origin main
git push origin "v$NEW_VERSION"
print_success "Changes and tag pushed to GitHub"

echo
print_success "🚀 Release process started!"
print_info "GitHub Actions will now build and create the release automatically."
print_info "You can monitor the progress at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')/actions"
