#!/bin/bash

# Net Worth Planner Release Upload Script
# Uploads locally built files to GitHub releases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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

print_header "Net Worth Planner Release Upload"
print_info "Version: $CURRENT_VERSION"
print_info "Tag: $VERSION_TAG"
echo

# Check if files exist
if [ ! -d "release/uploads" ] || [ ! "$(ls -A release/uploads)" ]; then
    print_error "No files found in release/uploads/"
    print_info "Run './scripts/build-release.sh' first"
    exit 1
fi

print_info "Files to upload:"
ls -la release/uploads/
echo

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    print_info "GitHub CLI detected. Would you like to use automated upload?"
    read -p "Use 'gh' CLI for automated upload? (y/N): " use_gh
    
    if [[ $use_gh =~ ^[Yy]$ ]]; then
        print_header "Creating GitHub Release with CLI"
        
        # Check if release already exists
        if gh release view "$VERSION_TAG" &> /dev/null; then
            print_warning "Release $VERSION_TAG already exists"
            read -p "Upload files to existing release? (y/N): " upload_existing
            
            if [[ $upload_existing =~ ^[Yy]$ ]]; then
                print_info "Uploading files to existing release..."
                for file in release/uploads/*; do
                    if [ -f "$file" ]; then
                        print_info "Uploading $(basename "$file")..."
                        gh release upload "$VERSION_TAG" "$file" --clobber
                        print_success "Uploaded $(basename "$file")"
                    fi
                done
                print_success "All files uploaded to existing release!"
            fi
        else
            # Create new release
            print_info "Creating new release..."
            
            # Generate release notes
            RELEASE_NOTES="## Net Worth Planner $VERSION_TAG

### 📥 Download Instructions

**Desktop App:**
- **Linux**: Download the \`.AppImage\` file
- Make the AppImage executable: \`chmod +x Net-Worth-Planner-*.AppImage\`
- Run the application: \`./Net-Worth-Planner-*.AppImage\`

### 🚀 Features
- Comprehensive financial planning tool
- Track your net worth and climb the wealth ladder
- Anti-spending habits tracking
- Guilt-free spending calculations
- Offline functionality with local data storage

### 💡 How to Use
1. Download the appropriate file for your operating system
2. Install and run the application
3. Your financial data stays local on your computer
4. Enjoy offline functionality and automatic folder sync

---

Built locally and uploaded manually to ensure quality and reliability."

            gh release create "$VERSION_TAG" \
                --title "Net Worth Planner $VERSION_TAG" \
                --notes "$RELEASE_NOTES" \
                release/uploads/*
                
            print_success "Release created and files uploaded!"
            print_info "View at: https://github.com/reido2012/wealth-ladder/releases/tag/$VERSION_TAG"
        fi
    fi
else
    print_warning "GitHub CLI not found. Using manual upload instructions."
fi

# Always show manual instructions
echo
print_header "Manual Upload Instructions"
print_info "If you prefer manual upload or GitHub CLI failed:"
echo
print_info "1. Go to: https://github.com/reido2012/wealth-ladder/releases"
print_info "2. Click 'Create a new release' (or 'Edit' if release exists)"
print_info "3. Tag version: $VERSION_TAG"
print_info "4. Release title: Net Worth Planner $VERSION_TAG"
print_info "5. Upload these files:"
echo
for file in release/uploads/*; do
    if [ -f "$file" ]; then
        echo "   📎 $(basename "$file")"
    fi
done
echo
print_info "6. Add release notes (see example in upload script)"
print_info "7. Publish release"
echo

print_success "Upload process completed!"
print_info "Files are ready in: $(pwd)/release/uploads/"
