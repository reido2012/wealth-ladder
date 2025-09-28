#!/bin/bash

# Net Worth Planner Local Build Script
# Builds distributable packages for all platforms locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
VERSION_TAG="v$CURRENT_VERSION"

print_header "Net Worth Planner Local Build Script"
print_info "Building version: $CURRENT_VERSION"
echo

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    print_warning "Working directory has uncommitted changes:"
    git status --short
    echo
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_info "Build cancelled."
        exit 0
    fi
fi

# Clean previous builds
print_info "Cleaning previous builds..."
rm -rf dist/ release/
print_success "Cleaned build directories"

# Build web assets
print_header "Building Web Application"
npm run build
print_success "Web build completed"

# Create release directory structure
mkdir -p release/uploads

# Build for current platform (Linux in your case)
print_header "Building Linux AppImage"
npm run dist -- --linux
if [ $? -eq 0 ]; then
    print_success "Linux build completed"
    
    # Copy and rename for consistency
    if [ -f "release/Net-Worth-Planner-$CURRENT_VERSION-x86_64.AppImage" ]; then
        cp "release/Net-Worth-Planner-$CURRENT_VERSION-x86_64.AppImage" "release/uploads/Net-Worth-Planner-$VERSION_TAG-linux-x64.AppImage"
        print_success "Linux AppImage ready: release/uploads/Net-Worth-Planner-$VERSION_TAG-linux-x64.AppImage"
    else
        print_warning "Linux AppImage not found at expected location"
        ls -la release/*.AppImage 2>/dev/null || print_warning "No AppImage files found"
    fi
else
    print_error "Linux build failed"
fi

echo
print_header "Build Summary"
print_info "Version: $CURRENT_VERSION"
print_info "Built on: $(date)"
echo

if [ -d "release/uploads" ] && [ "$(ls -A release/uploads)" ]; then
    print_success "Built files ready for upload:"
    ls -la release/uploads/
    echo
    
    print_info "Upload these files to your GitHub release:"
    print_info "1. Go to: https://github.com/reido2012/wealth-ladder/releases"
    print_info "2. Click 'Create a new release'"
    print_info "3. Tag: $VERSION_TAG"
    print_info "4. Upload files from: $(pwd)/release/uploads/"
    echo
    
    # Calculate file sizes
    print_info "File sizes:"
    du -h release/uploads/* 2>/dev/null || print_warning "No files to show sizes for"
    
else
    print_error "No files were built successfully"
    exit 1
fi

echo
print_success "🎉 Local build completed successfully!"
print_info "Next steps:"
echo "  1. Create GitHub release with tag: $VERSION_TAG"
echo "  2. Upload files from: release/uploads/"
echo "  3. Publish the release"
