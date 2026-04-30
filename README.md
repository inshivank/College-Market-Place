# College Marketplace with Recommendation System

A simple static web app where students can browse campus marketplace items and get similar item recommendations.

## Tech Stack

- HTML
- CSS
- JavaScript
- GitHub Pages compatible

## Features

- Display marketplace items with name, category, price, image, and tags.
- Filter items by category.
- Click an item to show up to 8 recommended items.
- Manual TF-IDF implementation in JavaScript.
- Cosine similarity scoring in JavaScript.
- KNN-style nearest neighbor selection for the top 8 recommendations.
- Separate `recommendationModel.js` file for the recommendation model.
- Similarity score shown for each recommended item.
- Matched tags shown for each recommendation to explain why it was suggested.
- Add new items using localStorage.
- Upload item images in the browser. Images are stored in localStorage as data URLs.
- Edit and delete items in the browser.
- Save a student profile with name and roll number.
- Wishlist/favorite items.
- Contact seller with seller name, email, optional phone, and WhatsApp Web link.
- Filter items by price range.
- Recently viewed items list.

## Recommendation Logic

This project uses a content-based recommendation system with K-Nearest Neighbors. Each item's tags are converted into a TF-IDF vector. Cosine similarity is then used as the distance/similarity measure between the selected item and all other items. The app applies KNN by sorting items by similarity score and selecting the top 8 nearest neighbors as recommendations.

Viva explanation:

> This project uses a content-based KNN recommendation system. Item tags are converted into TF-IDF vectors, cosine similarity is calculated, and the top 8 nearest items are recommended.

## Files

- `index.html`
- `style.css`
- `script.js`
- `recommendationModel.js`

## How To Run

Open `index.html` in a browser, or deploy the repository using GitHub Pages.

## GitHub Pages Deployment

1. Push this project to a GitHub repository.
2. Go to repository `Settings`.
3. Open `Pages`.
4. Choose the branch, usually `main`.
5. Choose the root folder `/`.
6. Save and open the GitHub Pages link after it finishes deploying.

The deployed site works because all logic is inside static files: `index.html`, `style.css`, `script.js`, and `recommendationModel.js`.

Note: GitHub Pages is static hosting. Add/edit/image upload works inside each visitor's browser using localStorage. To make all users share the same uploaded items online, connect a backend/database such as Firebase or Supabase.
