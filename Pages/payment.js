const API_URL = "http://127.0.0.1:5000/api";

const cart = JSON.parse(localStorage.getItem("cart")) || [];

const summaryContainer = document.getElementById("order-summary");
const totalElement = document.getElementById("payment-total");
const formArea = document.getElementById("payment-form-area");
const confirmBtn = document.getElementById("confirm-payment");

let total = 0;
let selectedMethod = null;

// Renderiza o resumo do pedido a partir do carrinho salvo no localStorage
function renderSummary() {
    summaryContainer.innerHTML = "";
    total = 0;

    if (cart.length === 0) {
        summaryContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
        totalElement.innerHTML = "";
        return;
    }

    cart.forEach(item => {
        const qty = item.quantity || 1;
        total += item.price * qty;

        summaryContainer.innerHTML += `
        <div class="summary-item">
            <span>${item.name} (x${qty})</span>
            <span>R$ ${(item.price * qty).toFixed(2)}</span>
        </div>
        `;
    });

    totalElement.innerHTML = `Total: R$ ${total.toFixed(2)}`;
}

renderSummary();

// Seleciona o método de pagamento e mostra o formulário correspondente
function selectMethod(method) {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    selectedMethod = method;

    document.querySelectorAll(".payment-method-btn").forEach(btn => {
        btn.classList.remove("selected");
    });
    document.getElementById(`method-${method}`).classList.add("selected");

    renderForm(method);
    confirmBtn.disabled = false;
}
window.selectMethod = selectMethod;

// Monta o formulário/instruções de cada forma de pagamento
function renderForm(method) {
    if (method === "debito" || method === "credito") {
        formArea.innerHTML = `
        <div class="payment-form">
            <label>Número do cartão</label>
            <input type="text" maxlength="19" placeholder="0000 0000 0000 0000" id="card-number">

            <label>Nome no cartão</label>
            <input type="text" placeholder="Nome completo" id="card-name">

            <div class="form-row">
                <div>
                    <label>Validade</label>
                    <input type="text" maxlength="5" placeholder="MM/AA" id="card-expiry">
                </div>
                <div>
                    <label>CVV</label>
                    <input type="text" maxlength="4" placeholder="123" id="card-cvv">
                </div>
            </div>
            ${method === "credito" ? `
            <label>Parcelas</label>
            <select id="installments">
                <option value="1">1x sem juros</option>
                <option value="2">2x sem juros</option>
                <option value="3">3x sem juros</option>
            </select>
            ` : ""}
        </div>
        `;
    } else if (method === "boleto") {
        const boletoNumber = generateFakeBoletoNumber();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        formArea.innerHTML = `
        <div class="payment-form boleto-info">
            <p>Boleto gerado com sucesso.</p>
            <p><strong>Código:</strong> ${boletoNumber}</p>
            <p><strong>Vencimento:</strong> ${dueDate.toLocaleDateString("pt-BR")}</p>
            <button type="button" id="copy-code">Copiar código</button>
        </div>
        `;

        document.getElementById("copy-code").addEventListener("click", () => {
            navigator.clipboard.writeText(boletoNumber);
            alert("Código copiado!");
        });
    } else if (method === "pix") {
        const pixCode = generateFakePixCode();

        formArea.innerHTML = `
        <div class="payment-form pix-info">
            <p>Escaneie o QR Code ou copie o código Pix abaixo:</p>
            <div class="pix-qr-placeholder">QR CODE</div>
            <p class="pix-code">${pixCode}</p>
            <button type="button" id="copy-code">Copiar código Pix</button>
        </div>
        `;

        document.getElementById("copy-code").addEventListener("click", () => {
            navigator.clipboard.writeText(pixCode);
            alert("Código Pix copiado!");
        });
    }
}

// Gera um número de boleto fictício apenas para fins de demonstração
function generateFakeBoletoNumber() {
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += Math.floor(10000 + Math.random() * 90000) + " ";
    }
    return code.trim();
}

// Gera um código Pix fictício apenas para fins de demonstração
function generateFakePixCode() {
    return "00020126580014BR.GOV.BCB.PIX" + Math.random().toString(36).substring(2, 15).toUpperCase();
}

// Confirma o pagamento: agora envia o pedido pra API salvar no banco de dados
confirmBtn.addEventListener("click", async () => {
    if (!selectedMethod) {
        alert("Selecione uma forma de pagamento.");
        return;
    }

    if (selectedMethod === "debito" || selectedMethod === "credito") {
        const number = document.getElementById("card-number").value;
        const name = document.getElementById("card-name").value;
        const expiry = document.getElementById("card-expiry").value;
        const cvv = document.getElementById("card-cvv").value;

        if (!number || !name || !expiry || !cvv) {
            alert("Preencha todos os dados do cartão.");
            return;
        }
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processando...";

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payment_method: selectedMethod,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                })),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao processar pedido.");
        }

        const order = await response.json();

        alert(`Pagamento confirmado! Pedido #${order.id} registrado.`);

        // Esvazia o carrinho após o pedido ser salvo no banco
        localStorage.setItem("cart", JSON.stringify([]));
        window.location.href = "../index.html";

    } catch (error) {
        alert(`Não foi possível concluir o pagamento: ${error.message}`);
        console.error(error);
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirmar Pagamento";
    }
});
