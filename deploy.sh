#!/bin/bash

# 🚀 Quick Deployment Script for Render

echo "🚀 Preparing for Render deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Ready for Render deployment"
fi
git commit -m "$commit_msg"

# Push to origin
echo "🔄 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Create new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Build Command: npm run build"
echo "   - Start Command: npm run start"
echo "5. Add environment variables from render-env-variables.txt"
echo "6. Deploy!"
echo ""
echo "📋 Environment variables file: render-env-variables.txt"
echo "📖 Full guide: DEPLOYMENT.md"
echo "✅ Checklist: RENDER-DEPLOYMENT-CHECKLIST.md"
echo ""
echo "🎉 Your app will be live at: https://your-service-name.onrender.com"
