// ===== Configuração =====
// Troque pelo número comercial real: código do país + DDD + número, só dígitos.
const NUMERO_WHATSAPP = "553491253232";

let orcamento = [];

// ===== 3. Elementos da página =====
const listaOrcamento = document.getElementById("lista-orcamento");
const totalOrcamento = document.getElementById("total-orcamento");
const formulario = document.getElementById("formulario-orcamento");
const campoNome = document.getElementById("nome-cliente");
const campoTelefone = document.getElementById("telefone-cliente");
const campoData = document.getElementById("data-evento");
const mensagemErro = document.getElementById("mensagem-erro");
const avisoCarrinho = document.getElementById("aviso-carrinho");

// ===== 4. Auxiliares =====
const formatarMoeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const calcularTotal = () =>
  orcamento.reduce((soma, item) => soma + item.preco, 0);

// "2026-10-20" -> "20/10/2026"
const formatarData = (dataISO) => dataISO.split("-").reverse().join("/");

// Data de hoje no formato do <input type="date"> (AAAA-MM-DD)
function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// ===== 5. Orçamento =====
function adicionarItem(cartao) {
  const nomeBase = cartao.querySelector(".cartao-kit__nome").textContent;
  const radio = cartao.querySelector('input[type="radio"]:checked');

  let id = cartao.dataset.id;
  let nome = nomeBase;
  let preco = Number(cartao.dataset.preco);

  if (radio) {
    // cartão com tamanhos (arco de balões): usa o tamanho marcado
    id = `${id}-${radio.value}`;
    nome = `${nomeBase} (${radio.value})`;
    preco = Number(radio.dataset.preco);
  }

  if (orcamento.some((item) => item.id === id)) {
    mostrarAviso(`${nome} já está no carrinho.`, "aviso");
    return;
  }

  orcamento.push({ id, nome, preco });
  renderizarOrcamento();
  mostrarAviso(`${nome} foi colocado no carrinho!`);

}

let temporizadorAviso;

function mostrarAviso(texto, tipo = "sucesso") {
  avisoCarrinho.textContent = texto;
  avisoCarrinho.className = `aviso-carrinho aviso-carrinho--${tipo} aviso-carrinho--visivel`;

  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => {
    avisoCarrinho.classList.remove("aviso-carrinho--visivel");
  }, 2500);
}

function removerItem(id) {
  orcamento = orcamento.filter((item) => item.id !== id);
  renderizarOrcamento();
}

function renderizarOrcamento() {
  listaOrcamento.innerHTML = "";

  if (orcamento.length === 0) {
    listaOrcamento.innerHTML =
      '<li class="orcamento__vazio">Nenhum kit selecionado ainda.</li>';
  }

  orcamento.forEach((item) => {
    const li = document.createElement("li");
    li.className = "orcamento__item";

    const texto = document.createElement("span");
    texto.textContent = `${item.nome}: ${formatarMoeda(item.preco)}`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "orcamento__remover";
    botao.textContent = "Remover";
    botao.dataset.id = item.id;

    li.append(texto, botao);
    listaOrcamento.append(li);
  });

  totalOrcamento.textContent = formatarMoeda(calcularTotal());
}

// ===== 6. Cliques =====
document.addEventListener("click", (e) => {
  const botaoAdicionar = e.target.closest('[data-acao="adicionar"]');
  if (botaoAdicionar) {
    adicionarItem(botaoAdicionar.closest(".cartao-kit"));
    return;
  }

  const botaoRemover = e.target.closest(".orcamento__remover");
  if (botaoRemover) removerItem(botaoRemover.dataset.id);
});

// ===== 7. Validação =====
// Devolve o texto do erro, ou "" se estiver tudo certo
function validarFormulario() {
  if (orcamento.length === 0) return "Adicione pelo menos um item ao orçamento.";
  if (campoNome.value.trim() === "") return "Informe seu nome.";

  const digitos = campoTelefone.value.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11)
    return "Informe um telefone válido, com DDD.";

  if (campoData.value === "") return "Informe a data do evento.";
  if (campoData.value < hojeISO())
    return "A data do evento não pode ser anterior a hoje.";

  return "";
}

// ===== 8. Mensagem e envio =====
function montarMensagem() {
  const itens = orcamento.map(
    (item) => `• ${item.nome}: ${formatarMoeda(item.preco)}`
  );

  return [
    "Olá! Gostaria de solicitar um Kit de decoração:",
    "",
    `Nome: ${campoNome.value.trim()}`,
    `Telefone: ${campoTelefone.value.trim()}`,
    `Data do evento: ${formatarData(campoData.value)}`,
    "",
    "Itens:",
    ...itens,
    "",
    `Total : ${formatarMoeda(calcularTotal())}`,
    "",
    "",
  ].join("\n");
}

formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  const erro = validarFormulario();
  mensagemErro.textContent = erro;
  if (erro) return;

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(montarMensagem())}`;
  window.open(url, "_blank", "noopener");
});

// ===== 9. Inicialização =====
campoData.min = hojeISO(); // o calendário já bloqueia datas passadas
renderizarOrcamento();