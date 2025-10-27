#!/bin/bash

# BigEventz.com - Automated Deployment Script
# This script will deploy your website to GitHub and Railway

set -e  # Exit on error

echo "🚀 BigEventz.com - Automated Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the bigeventz_backend directory.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking GitHub authentication...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI not authenticated. Logging in...${NC}"
    gh auth login
else
    echo -e "${GREEN}✓ GitHub authentication verified${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Creating GitHub repository...${NC}"
REPO_NAME="bigeventz"

# Check if repository already exists
if gh repo view "$REPO_NAME" &> /dev/null; then
    echo -e "${YELLOW}Repository already exists. Using existing repository.${NC}"
else
    echo -e "${YELLOW}Creating new repository: $REPO_NAME${NC}"
    gh repo create "$REPO_NAME" --public --description "BigEventz.com - Event Management Platform" --source=. --remote=origin
    echo -e "${GREEN}✓ Repository created successfully${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Pushing code to GitHub...${NC}"
git branch -M main
git remote add origin "https://github.com/$(gh api user -q .login)/$REPO_NAME.git" 2>/dev/null || true
git push -u origin main --force

echo -e "${GREEN}✓ Code pushed to GitHub${NC}"

echo ""
echo -e "${BLUE}Step 4: Getting repository URL...${NC}"
REPO_URL=$(gh repo view --json url -q .url)
echo -e "${GREEN}✓ Repository URL: $REPO_URL${NC}"

echo ""
echo "========================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}Your code is now on GitHub:${NC}"
echo -e "${GREEN}$REPO_URL${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Deploy to Railway (Recommended):"
echo -e "   ${YELLOW}Visit: https://railway.app${NC}"
echo "   - Click 'New Project'"
echo "   - Select 'Deploy from GitHub repo'"
echo "   - Choose 'bigeventz'"
echo "   - Your site will be live in 2-3 minutes!"
echo ""
echo "2. Deploy to Vercel:"
echo -e "   ${YELLOW}Run: vercel${NC}"
echo ""
echo "3. Deploy to Netlify:"
echo -e "   ${YELLOW}Run: netlify deploy --prod${NC}"
echo ""
echo "4. One-click deploy buttons:"
echo -e "   ${YELLOW}Railway:${NC} https://railway.app/new/template?template=$REPO_URL"
echo -e "   ${YELLOW}Vercel:${NC} https://vercel.com/new/clone?repository-url=$REPO_URL"
echo -e "   ${YELLOW}Netlify:${NC} https://app.netlify.com/start/deploy?repository=$REPO_URL"
echo ""
echo -e "${GREEN}✨ Your BigEventz.com website is ready to go live!${NC}"
echo ""

