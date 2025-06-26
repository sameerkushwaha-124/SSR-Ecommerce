# 🚀 Render Deployment Guide

## 📋 Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas database (already configured)

## 🔧 Environment Variables for Render

Copy these environment variables to your Render service:

### Required Environment Variables:
```
MONGODB_URI=mongodb+srv://sameerkushwaha2003:FMtyttbrxz5wHMpS@cluster0.dn6pzce.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
JWT_KEY=asfdasfaskfjhhjknsjisdnjsdn
EXPRESS_SESSION_SECRET=supersecretkey123
NODE_ENV=production
```

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

### 3. Service Configuration
```
Name: ssr-ecommerce
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Build Command: npm run build
Start Command: npm run start
```

### 4. Environment Variables Setup
In Render dashboard, go to Environment tab and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://sameerkushwaha2003:FMtyttbrxz5wHMpS@cluster0.dn6pzce.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0` |
| `PORT` | `5000` |
| `JWT_KEY` | `asfdasfaskfjhhjknsjisdnjsdn` |
| `EXPRESS_SESSION_SECRET` | `supersecretkey123` |
| `NODE_ENV` | `production` |

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Run `npm run build`
   - Run `npm run start`
   - Deploy your application

## 🔍 Verification Checklist

### ✅ Pre-deployment:
- [ ] All environment variables configured
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] Package.json has correct scripts
- [ ] .env file is in .gitignore
- [ ] Code pushed to GitHub

### ✅ Post-deployment:
- [ ] Service builds successfully
- [ ] Application starts without errors
- [ ] Database connection works
- [ ] Authentication functions properly
- [ ] All routes accessible

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json

2. **Database Connection Error**
   - Verify MongoDB URI is correct
   - Check MongoDB Atlas network access settings

3. **Environment Variables Not Working**
   - Ensure variables are set in Render dashboard
   - Check variable names match exactly

4. **Session Issues**
   - Verify EXPRESS_SESSION_SECRET is set
   - Check cookie settings for HTTPS

## 📱 Access Your Application

Once deployed, your application will be available at:
```
https://your-service-name.onrender.com
```

## 🔄 Updates

To update your application:
1. Push changes to GitHub
2. Render will automatically redeploy
3. Monitor deployment logs in Render dashboard

## 📊 Monitoring

- Check Render dashboard for:
  - Deployment logs
  - Application metrics
  - Error monitoring
  - Performance insights

## 🔐 Security Notes

- All sensitive data is in environment variables
- HTTPS is automatically enabled by Render
- Session cookies are secure in production
- Database credentials are protected

## 💡 Tips

1. **Free Tier Limitations:**
   - Service sleeps after 15 minutes of inactivity
   - 750 hours/month limit
   - Cold start delay when waking up

2. **Performance:**
   - Consider upgrading to paid plan for production
   - Monitor response times
   - Optimize database queries

3. **Scaling:**
   - Render handles auto-scaling
   - Monitor resource usage
   - Consider CDN for static assets

## 🆘 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test locally with production settings
4. Contact Render support if needed

---

**Your SSR E-commerce application is now ready for production deployment! 🎉**
