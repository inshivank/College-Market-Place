from flask import Flask, render_template, request, redirect
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)

# Folder for images
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

categories = ["Books", "Electronics", "Clothes", "Others"]

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

@app.route('/')
def home():
    return render_template('home.html', items=items)

@app.route('/add', methods=['GET', 'POST'])
def add_item():
    if request.method == 'POST':
        name = request.form['name']
        category = request.form['category']
        price = int(request.form['price'])
        tags = request.form['tags'].replace("#", "").lower()

        image_file = request.files['image']
        filename = image_file.filename

        if filename:
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(path)
        else:
            filename = "default.png"

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

@app.route('/item/<int:item_id>')
def view_item(item_id):

    selected_index = next(i for i, item in enumerate(items) if item["id"] == item_id)

    tag_list = [item["tags"] for item in items]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(tag_list)

    similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)

    scores = list(enumerate(similarity[selected_index]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    recommended = [items[i[0]] for i in scores[1:4]]

    return render_template('item.html', item=items[selected_index], recommended=recommended)

if __name__ == '__main__':
    app.run(debug=True)

    0404@Coffee