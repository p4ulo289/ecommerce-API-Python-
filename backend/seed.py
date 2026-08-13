
from app import app
from models import db, Product

produtos_iniciais = [
    {
        "name": "Tênis nike",
        "price": 300,
        "amount": 50,
        "image": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRsGtOZnAowg7uUtLX0Abi1e2-_VATptJLqQWAF7vxBW_6JQm_EGm_zUg7cuGr9V0BfD0AqZxbbw9odVJpN90ZgFGrPF8WgCD4ezv4dQ7cuhAKtKiUd4ONmow",
    },
    {
        "name": "Camisa balenciaga",
        "price": 400,
        "amount": 25,
        "image": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS--_NO7yDKMXe6vG8p3weVzZZEe4IUD5KiM_9DKjQJ7AJu5wWbwXnARgvLemsXkoGPMTC0yYf2uMZYARoFhAwfkt4ygRpTvL7sl0EoHVrzcARrLf0zz86DPXE",
    },
    {
        "name": "Calça Diesel",
        "price": 350,
        "amount": 40,
        "image": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRI3HEZIL-jZi2Tir4AJxvgxPK7eS0q3ndTBfwZkUVQZWYPqOT--ZdN9GUs45Iklfmmn0v0Z2_dZF5aVxhArdkUaom_Qrev",
    },
]

with app.app_context():
    db.create_all()

    if Product.query.count() == 0:
        for p in produtos_iniciais:
            db.session.add(Product(**p))
        db.session.commit()
        print(f"{len(produtos_iniciais)} produtos inseridos no banco.")
    else:
        print("Já existem produtos no banco, nada foi inserido.")
