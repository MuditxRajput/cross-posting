# 🚀 Post Target - Social Media Post Scheduler

[Live Demo](http://cross-posting-web.vercel.app/) | Made with ❤️ using Next.js, Node.js, MongoDB, BullMQ, AWS Lambda, EC2

## 📌 Overview

**Post Target** is a full-stack social media post scheduling platform that allows users to compose, schedule, and publish content across multiple social media platforms. Whether you're a content creator, marketer, or business, Post Target simplifies your posting workflow with automation and precision.

## ✨ Features

- 📝 Create & edit posts with rich text and media
- 📅 Schedule posts for future dates/times
- 🔄 Cross-post to multiple platforms
- ⚙️ Background job processing using BullMQ
- ☁️ Serverless execution with AWS Lambda
- 🖥️ Scalable deployment using AWS EC2
- 🔒 User authentication and role-based access
- 📊 Analytics-ready architecture

## 🛠️ Tech Stack

| Technology | Role |
|------------|------|
| **Next.js** | Frontend (React-based SSR) |
| **Node.js** | Backend API |
| **MongoDB** | Database for user & post data |
| **BullMQ** | Job queue for scheduling posts |
| **AWS Lambda** | Serverless posting engine |
| **AWS EC2** | Hosting backend services |


## 🚧 Project Status

✅ MVP Completed  
🚀 Currently supports post scheduling and background execution  
🛠️ Upcoming: Multi-platform integration (Instagram, Twitter, LinkedIn), analytics dashboard, notifications

## 📸 Screenshots
<img width="1901" height="863" alt="image" src="https://github.com/user-attachments/assets/3d627618-42b6-4f32-8f77-1724051df49e" />


## 🚀 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/post-target.git
cd post-target

# Install dependencies
npm install

# Create a .env file with the following variables:
# MONGODB_URI=...
# REDIS_URL=...
# AWS_LAMBDA_ARN=...
# (Add all required secrets)

# Run the development server
npm run dev
npm run test
```
---

### ✅ Tips for Making it Even Better:
- Add **GIFs or short videos** showing how the scheduler works.
- Add **badges** like: `Build Passing`, `MIT License`, `Vercel Deployed`, etc.
- Consider a `CONTRIBUTING.md` if you want others to help.
- If you built APIs, consider adding an **API reference** section.

---

