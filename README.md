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
- Click an item to show the top 3 recommended items.
- Manual TF-IDF implementation in JavaScript.
- Cosine similarity scoring in JavaScript.
- Similarity score shown for each recommended item.
- Add new items using localStorage.
- Upload item images in the browser. Images are stored in localStorage as data URLs.

## Recommendation Logic

This project uses a content-based recommendation system. Each item's tags are converted into a TF-IDF vector. Cosine similarity is then used to compare the selected item with all other items. The app sorts items by similarity score and displays the top 3 matches.

Viva explanation:

> This project uses a content-based recommendation system implemented using TF-IDF and cosine similarity to suggest similar items.

## Files

- `index.html`
- `style.css`
- `script.js`

## How To Run

Open `index.html` in a browser, or deploy the repository using GitHub Pages.

## GitHub Pages Deployment

1. Push this project to a GitHub repository.
2. Go to repository `Settings`.
3. Open `Pages`.
4. Choose the branch, usually `main`.
5. Choose the root folder `/`.
6. Save and open the GitHub Pages link after it finishes deploying.

The deployed site works because all logic is inside `index.html`, `style.css`, and `script.js`.

Note: GitHub Pages is static hosting. Add/edit/image upload works inside each visitor's browser using localStorage. To make all users share the same uploaded items online, connect a backend/database such as Firebase or Supabase.
