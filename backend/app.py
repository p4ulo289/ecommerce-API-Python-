from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Product, Order, OrderItem

app = Flask(__name__)

# Onde o banco de dados SQLite vai ser salvo
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///devmarket.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


CORS(app)

""" Produtos """

@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())


""" Pedidos """

@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    if not data or "items" not in data or not data["items"]:
        return jsonify({"error": "Pedido sem itens."}), 400

    if "payment_method" not in data:
        return jsonify({"error": "Forma de pagamento não informada."}), 400

    total = 0
    order_items = []

    # Valida cada item contra o banco
    for item in data["items"]:
        product = db.session.get(Product, item.get("product_id"))
        if not product:
            return jsonify({"error": f"Produto {item.get('product_id')} não encontrado."}), 404

        quantity = item.get("quantity", 1)
        subtotal = product.price * quantity
        total += subtotal

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                price=product.price,
            )
        )

    order = Order(
        total=total,
        payment_method=data["payment_method"],
        status="confirmado",
        items=order_items,
    )

    db.session.add(order)
    db.session.commit()

    return jsonify(order.to_dict()), 201


@app.route("/api/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict())


@app.route("/api/orders", methods=["GET"])
def list_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


if __name__ == "__main__":
    with app.app_context():
        db.create_all() 
    app.run(debug=True, port=5000)
