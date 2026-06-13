# College Marketplace with Intelligent Recommendation System

A smart campus marketplace platform designed to simplify buying and selling among students while providing personalized item recommendations through Machine Learning concepts. The application enables students to discover relevant products faster by leveraging a content-based recommendation engine built from scratch using TF-IDF vectorization, Cosine Similarity, and K-Nearest Neighbors (KNN).

The platform allows users to browse marketplace listings, filter products by category and price, save favorite items, contact sellers, manage personal profiles, and receive intelligent recommendations based on item similarity. Unlike traditional marketplace applications, the recommendation engine explains suggestions through similarity scores and matched tags, improving transparency and user trust.

Developed as a lightweight static web application using HTML, CSS, and JavaScript, the project demonstrates the practical application of recommendation systems, information retrieval techniques, and client-side data management through localStorage. The system is fully compatible with GitHub Pages deployment, making it accessible without requiring a backend server.

## Key Features

* Browse and search marketplace listings
* Category and price-based filtering
* Wishlist and favorite item management
* Recently viewed items tracking
* Student profile management
* Seller contact integration (Email, Phone, WhatsApp)
* Add, edit, and delete marketplace listings
* Image upload and storage using localStorage
* Explainable recommendations with similarity scores
* Matched tag visualization for recommendation transparency

## Recommendation Engine

The recommendation system follows a Content-Based Filtering approach:

1. Item tags are converted into TF-IDF vectors.
2. Cosine Similarity is calculated between items.
3. K-Nearest Neighbors (KNN) identifies the most similar products.
4. The top 8 nearest items are recommended to the user.
5. Similarity scores and matched tags are displayed to explain recommendations.

This implementation demonstrates core Machine Learning and Information Retrieval concepts without relying on external libraries.

## Tech Stack

* HTML5
* CSS3
* JavaScript (ES6)
* LocalStorage
* GitHub Pages

## Project Structure

```text
College-Marketplace/
│
├── index.html                 # User interface
├── style.css                  # Styling and responsive design
├── script.js                  # Marketplace functionality
├── recommendationModel.js     # TF-IDF, Cosine Similarity, and KNN logic
└── README.md                  # Project documentation
```

## Learning Outcomes

Through this project, I gained hands-on experience in:

* Recommendation System Design
* Content-Based Filtering
* TF-IDF Vectorization
* Cosine Similarity Computation
* K-Nearest Neighbors (KNN)
* Frontend Development
* Client-Side Data Persistence
* Explainable AI Concepts
* User-Centric Application Design

## Deployment

The application is fully static and can be deployed directly on GitHub Pages, Netlify, or Vercel without requiring a backend server.

## Future Enhancements

* User authentication and authorization
* Firebase/Supabase database integration
* Collaborative filtering recommendations
* Personalized recommendation profiles
* Product search using NLP techniques
* Real-time chat between buyers and sellers
* Analytics dashboard for marketplace insights

## Project Impact

This project demonstrates how Machine Learning concepts can be integrated into real-world web applications to enhance user experience. By combining recommendation algorithms with an intuitive marketplace interface, the platform helps students discover relevant products more efficiently while showcasing practical skills in Artificial Intelligence, Data Science, and Full-Stack Development.
ic hosting. Add/edit/image upload works inside each visitor's browser using localStorage. To make all users share the same uploaded items online, connect a backend/database such as Firebase or Supabase.
