from flask import Flask, render_template, request, redirect
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
import numpy as np
import os

app = Flask(__name__)

# ---------------- CONFIG ----------------
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

categories = ["Books", "Electronics", "Clothes", "Others"]

# ---------------- DATA ----------------
items = [
    {"id": 1, "name": "Math Book", "category": "Books", "price": 200, "tags": "book study education"},
    {"id": 2, "name": "Physics Book", "category": "Books", "price": 300, "tags": "book science study"},
    {"id": 3, "name": "Chemistry Book", "category": "Books", "price": 280, "tags": "book science chemistry"},
    {"id": 4, "name": "Programming Book", "category": "Books", "price": 500, "tags": "book coding programming"},
    {"id": 5, "name": "Laptop", "category": "Electronics", "price": 40000, "tags": "electronics computer coding"},
    {"id": 6, "name": "Gaming Laptop", "category": "Electronics", "price": 70000, "tags": "electronics gaming computer"},
    {"id": 7, "name": "Headphones", "category": "Electronics", "price": 1500, "tags": "electronics audio music"},
    {"id": 8, "name": "Bluetooth Speaker", "category": "Electronics", "price": 2500, "tags": "electronics audio music"},
    {"id": 9, "name": "Mobile Phone", "category": "Electronics", "price": 20000, "tags": "electronics phone gadget"},
    {"id": 10, "name": "Smart Watch", "category": "Electronics", "price": 5000, "tags": "electronics wearable gadget"},
    {"id": 11, "name": "T-Shirt", "category": "Clothes", "price": 500, "tags": "clothes casual fashion"},
    {"id": 12, "name": "Jeans", "category": "Clothes", "price": 1200, "tags": "clothes denim fashion"},
    {"id": 13, "name": "Jacket", "category": "Clothes", "price": 2500, "tags": "clothes winter fashion"},
    {"id": 14, "name": "Hoodie", "category": "Clothes", "price": 1800, "tags": "clothes winter casual"},
    {"id": 15, "name": "Formal Shirt", "category": "Clothes", "price": 1000, "tags": "clothes formal office"},
    {"id": 16, "name": "Notebook", "category": "Books", "price": 100, "tags": "book notes study"},
    {"id": 17, "name": "Calculator", "category": "Electronics", "price": 600, "tags": "electronics study calculator"},
    {"id": 18, "name": "Pen Set", "category": "Others", "price": 150, "tags": "stationery study writing"},
    {"id": 19, "name": "Backpack", "category": "Others", "price": 1200, "tags": "bag college travel"},
    {"id": 20, "name": "Water Bottle", "category": "Others", "price": 300, "tags": "daily utility bottle"},
    {"id": 21, "name": "Keyboard", "category": "Electronics", "price": 1000, "tags": "electronics typing computer"},
    {"id": 22, "name": "Mouse", "category": "Electronics", "price": 500, "tags": "electronics computer accessory"},
    {"id": 23, "name": "Monitor", "category": "Electronics", "price": 8000, "tags": "electronics display computer"},
    {"id": 24, "name": "USB Drive", "category": "Electronics", "price": 700, "tags": "electronics storage data"},
    {"id": 25, "name": "Power Bank", "category": "Electronics", "price": 1200, "tags": "electronics battery mobile"},
    {"id": 26, "name": "Sneakers", "category": "Clothes", "price": 2000, "tags": "shoes casual fashion"},
    {"id": 27, "name": "Sandals", "category": "Clothes", "price": 800, "tags": "shoes casual summer"},
    {"id": 28, "name": "Cap", "category": "Clothes", "price": 400, "tags": "fashion accessory casual"},
    {"id": 29, "name": "Scarf", "category": "Clothes", "price": 600, "tags": "fashion winter accessory"},
    {"id": 30, "name": "Blanket", "category": "Others", "price": 1500, "tags": "winter comfort"},
    {"id": 31, "name": "Pillow", "category": "Others", "price": 700, "tags": "sleep comfort"},
    {"id": 32, "name": "Desk Lamp", "category": "Others", "price": 900, "tags": "study light"},
    {"id": 33, "name": "Extension Board", "category": "Others", "price": 500, "tags": "electric utility"},
    {"id": 34, "name": "Router", "category": "Electronics", "price": 2500, "tags": "internet wifi electronics"},
    {"id": 35, "name": "Tablet", "category": "Electronics", "price": 15000, "tags": "electronics study gadget"},
    {"id": 36, "name": "E-Book Reader", "category": "Electronics", "price": 9000, "tags": "reading book gadget"},
    {"id": 37, "name": "Drawing Book", "category": "Books", "price": 250, "tags": "art drawing book"},
    {"id": 38, "name": "Story Book", "category": "Books", "price": 350, "tags": "reading story book"},
    {"id": 39, "name": "Cookbook", "category": "Books", "price": 450, "tags": "food cooking book"},
    {"id": 40, "name": "Diary", "category": "Books", "price": 200, "tags": "writing personal notes"},
    {"id": 41, "name": "Sunglasses", "category": "Clothes", "price": 1000, "tags": "fashion accessory"},
    {"id": 42, "name": "Watch", "category": "Clothes", "price": 2500, "tags": "fashion time accessory"},
    {"id": 43, "name": "Earbuds", "category": "Electronics", "price": 3000, "tags": "electronics audio wireless"},
    {"id": 44, "name": "Tripod", "category": "Electronics", "price": 1200, "tags": "camera stand accessory"},
    {"id": 45, "name": "Camera", "category": "Electronics", "price": 30000, "tags": "photography electronics"},
    {"id": 46, "name": "Whiteboard", "category": "Others", "price": 1500, "tags": "study teaching board"},
    {"id": 47, "name": "Marker Set", "category": "Others", "price": 300, "tags": "writing board"},
    {"id": 48, "name": "Gaming Mouse", "category": "Electronics", "price": 2000, "tags": "gaming electronics computer"},
    {"id": 49, "name": "Gaming Keyboard", "category": "Electronics", "price": 3000, "tags": "gaming electronics computer"},
    {"id": 50, "name": "Bean Bag", "category": "Others", "price": 2500, "tags": "comfort furniture"}
]


# ---------------- HELPER FUNCTIONS ----------------

def clean_tags(raw_tags):
    return raw_tags.replace("#", "").lower()


def save_image(file):
    if file and file.filename:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        return file.filename
    return "default.png"


# ---------------- ML PIPELINE ----------------

def extract_features(items):
    # TEXT FEATURES (TF-IDF)
    tags = [item["tags"] for item in items]
    vectorizer = TfidfVectorizer()
    text_features = vectorizer.fit_transform(tags).toarray()

    # NUMERIC FEATURE (PRICE)
    prices = np.array([item["price"] for item in items]).reshape(-1, 1)
    scaler = MinMaxScaler()
    price_features = scaler.fit_transform(prices)

    # COMBINE FEATURES
    features = np.hstack((text_features, price_features))

    return features


def train_knn_model(features):
    model = NearestNeighbors(n_neighbors=4, metric='euclidean')
    model.fit(features)
    return model


def get_recommendations(items, selected_index):
    features = extract_features(items)
    model = train_knn_model(features)

    distances, indices = model.kneighbors([features[selected_index]])

    # Skip itself
    recommended_indices = indices[0][1:]

    return [items[i] for i in recommended_indices]


# ---------------- ROUTES ----------------

@app.route('/')
def home():
    filtered_items = items.copy()

    category = request.args.get('category')
    if category:
        filtered_items = [i for i in filtered_items if i["category"] == category]

    sort = request.args.get('sort')
    if sort == "low":
        filtered_items.sort(key=lambda x: x["price"])
    elif sort == "high":
        filtered_items.sort(key=lambda x: x["price"], reverse=True)

    return render_template('home.html', items=filtered_items)


@app.route('/add', methods=['GET', 'POST'])
def add_item():
    if request.method == 'POST':
        name = request.form['name']
        category = request.form['category']
        price = int(request.form['price'])
        tags = clean_tags(request.form['tags'])

        image_file = request.files['image']
        filename = save_image(image_file)

        items.append({
            "id": len(items) + 1,
            "name": name,
            "category": category,
            "price": price,
            "tags": tags,
            "image": filename
        })

        return redirect('/')

    return render_template('add.html', categories=categories)


@app.route('/edit/<int:item_id>', methods=['GET', 'POST'])
def edit_item(item_id):

    item = next(x for x in items if x["id"] == item_id)

    if request.method == 'POST':
        item["name"] = request.form['name']
        item["category"] = request.form['category']
        item["price"] = int(request.form['price'])
        item["tags"] = clean_tags(request.form['tags'])

        image_file = request.files['image']
        if image_file.filename:
            item["image"] = save_image(image_file)

        return redirect(f'/item/{item_id}')

    return render_template('edit.html', item=item, categories=categories)


@app.route('/item/<int:item_id>')
def view_item(item_id):

    selected_index = next(i for i, item in enumerate(items) if item["id"] == item_id)

    recommended_items = get_recommendations(items, selected_index)

    return render_template('item.html', item=items[selected_index], recommended=recommended_items)


# ---------------- RUN ----------------

if __name__ == '__main__':
    app.run(debug=True)