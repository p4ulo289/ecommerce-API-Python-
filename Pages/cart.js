const cart = JSON.parse(localStorage.getItem("cart")) || [];
const container = document.getElementById("cart-items");
const totalElement = document.getElementById("total"); // Pegando o elemento do total
const checkoutBtn = document.getElementById("checkout-btn");

let total = 0;

container.innerHTML = ""; // Limpa o container antes de renderizar

cart.forEach((item, index) => {
    total += item.price * (item.quantity || 1);

    container.innerHTML += `
    <div class="cart-item">
        <img src="${item.image}" alt="${item.name}"class="cart-img">
        <div class="cart-info">
            <h3>${item.name}</h3>
            <p>R$ ${item.price}</p>

            <div class="quantity-controls"> 
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity || 1}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <button onclick="removeItem(${item.id})" class="btn-remove">Excluir</button>
        </div>    
    </div>
    `;
});

// Corrigido para garantir que o elemento existe antes de escrever
if (totalElement) {
    totalElement.innerHTML = `Total R$ ${total}`;
}

// Desabilita o botão de pagamento se o carrinho estiver vazio
if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
}

//função para excluir os itens

function removeItem(id) {
    // 1. Filtra o carrinho: cria um novo array sem o item do ID selecionado
    // Usamos o filter para remover apenas a primeira ocorrência ou todas com esse ID
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart.splice(index, 1); // Remove 1 item na posição encontrada
    }

    // 2. Salva a lista atualizada no LocalStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // 3. Recarrega a página ou chama a função de renderizar novamente
    location.reload(); 
}

//----------------------------

//função para alterar a quantidade

function changeQuantity(index, change) {
    if (!cart[index].quantity) {
        cart[index].quantity = 1;
    }
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}

window.changeQuantity = changeQuantity;

//----------------------------

function esvaziar() {
    if (confirm("Deseja realmente esvaziar o seu carrinho?")) {
        
        localStorage.setItem("cart", JSON.stringify([]));

        location.reload();
    }
}

window.esvaziar = esvaziar;

// Torna a função global para o botão conseguir usá-la

window.removeItem = removeItem
