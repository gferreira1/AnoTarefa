// Controle das abas
function trocarAba(id) {
  document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
  document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('ativo'));
  document.getElementById(`btn-${id}`).classList.add('ativo');
}

// Capitaliza a primeira letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Adicionar tarefa ou compra
function adicionar(tipo) {
  const input = document.getElementById(`${tipo}Input`);
  const prioridade = parseInt(document.getElementById(`prioridade${capitalize(tipo)}`).value);
  const texto = input.value.trim();
  if (!texto) return;

  const listaId = tipo === 'tarefa' ? 'listaTarefas' : 'listaCompras';
  const lista = document.getElementById(listaId);
  const item = criarItem(texto, prioridade, tipo);

  lista.appendChild(item);
  ordenarLista(lista);
  salvarDados();
  input.value = '';
}

// Cria o elemento tarefa/compra com subtarefas
function criarItem(texto, prioridade, tipo, subtarefas = [], concluido = false) {
  const item = document.createElement('div');
  item.className = 'item';
  item.dataset.prioridade = prioridade;

  if(concluido) item.classList.add('concluido');

  // Container da tarefa
  const conteudo = document.createElement('div');
  conteudo.className = 'item-conteudo';

  // Checkbox tarefa principal
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = concluido;
  checkbox.onchange = () => {
    item.classList.toggle('concluido');
    // Marcar/desmarcar todas subtarefas
    subtarefasContainer.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.checked = checkbox.checked;
      cb.dispatchEvent(new Event('change'));
    });
    salvarDados();
  };

  // Texto tarefa principal
  const span = document.createElement('span');
  span.textContent = texto;
  span.onclick = () => editarTexto(span, item, tipo);

  // Botão remover tarefa principal
  const btnRemover = document.createElement('button');
  btnRemover.textContent = 'X';
  btnRemover.title = 'Remover tarefa';
  btnRemover.onclick = () => {
    if (confirm('Remover esta tarefa e todas as subtarefas?')) {
      item.remove();
      salvarDados();
    }
  };

  conteudo.appendChild(checkbox);
  conteudo.appendChild(span);
  conteudo.appendChild(btnRemover);

  item.appendChild(conteudo);

  // Container subtarefas
  const subtarefasContainer = document.createElement('div');
  subtarefasContainer.className = 'subtarefas';

  // Criar subtarefas salvas
  subtarefas.forEach(sub => {
    const subItem = criarSubtarefa(sub.texto, sub.concluido, subtarefasContainer);
    subtarefasContainer.appendChild(subItem);
  });

  item.appendChild(subtarefasContainer);

  // Botão adicionar subtarefa
  const botaoSub = document.createElement('button');
  botaoSub.className = 'botao-subtarefa';
  botaoSub.textContent = '+ Subtarefa';
  botaoSub.onclick = () => {
    const textoSub = prompt('Digite a subtarefa:');
    if (textoSub && textoSub.trim()) {
      const novoSub = criarSubtarefa(textoSub.trim(), false, subtarefasContainer);
      subtarefasContainer.appendChild(novoSub);
      checkbox.checked = false;
      item.classList.remove('concluido');
      salvarDados();
    }
  };

  item.appendChild(botaoSub);

  return item;
}

// Cria elemento subtarefa
function criarSubtarefa(texto, concluido, containerPai) {
  const subItem = document.createElement('div');
  subItem.className = 'subitem';
  if(concluido) subItem.classList.add('concluido');

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = concluido;
  cb.onchange = () => {
    if (cb.checked) {
      subItem.classList.add('concluido');
    } else {
      subItem.classList.remove('concluido');
    }
    atualizaTarefaPai(containerPai.parentNode);
    salvarDados();
  };

  const span = document.createElement('span');
  span.textContent = texto;
  span.onclick = () => editarTexto(span);

  const btnRemover = document.createElement('button');
  btnRemover.textContent = 'X';
  btnRemover.title = 'Remover subtarefa';
  btnRemover.onclick = () => {
    if (confirm('Remover esta subtarefa?')) {
      subItem.remove();
      atualizaTarefaPai(containerPai.parentNode);
      salvarDados();
    }
  };

  subItem.appendChild(cb);
  subItem.appendChild(span);
  subItem.appendChild(btnRemover);

  return subItem;
}

// Atualiza o estado da tarefa pai conforme subtarefas
function atualizaTarefaPai(item) {
  const subtarefas = Array.from(item.querySelectorAll('.subtarefas .subitem'));
  const checkbox = item.querySelector('input[type=checkbox]');
  const todasConcluidas = subtarefas.length > 0 && subtarefas.every(sub => sub.querySelector('input[type=checkbox]').checked);

  if (todasConcluidas) {
    checkbox.checked = true;
    item.classList.add('concluido');
  } else {
    checkbox.checked = false;
    item.classList.remove('concluido');
  }
}

// Editar texto da tarefa ou subtarefa
function editarTexto(span, itemPai, tipo) {
  const novo = prompt('Editar texto:', span.textContent);
  if (novo && novo.trim()) {
    span.textContent = novo.trim();
    if(itemPai) {
      salvarDados();
    } else {
      salvarDados();
    }
  }
}

// Ordenar lista pela prioridade
function ordenarLista(lista) {
  const itens = Array.from(lista.children);
  itens.sort((a, b) => a.dataset.prioridade - b.dataset.prioridade);
  itens.forEach(i => lista.appendChild(i));
}

// Filtrar itens por busca (título da tarefa principal e subtarefas)
function filtrar() {
  const filtro = document.getElementById('busca').value.toLowerCase();
  ['listaTarefas', 'listaCompras'].forEach(id => {
    const lista = document.getElementById(id);
    Array.from(lista.children).forEach(item => {
      const textoPrincipal = item.querySelector('.item-conteudo span').textContent.toLowerCase();
      const subtarefas = Array.from(item.querySelectorAll('.subtarefas .subitem span'));
      const temSub = subtarefas.some(s => s.textContent.toLowerCase().includes(filtro));
      const match = textoPrincipal.includes(filtro) || temSub;
      item.style.display = match ? '' : 'none';
    });
  });
}

// Salvar no localStorage
function salvarDados() {
  const dados = { tarefas: [], compras: [] };
  ['tarefa', 'compra'].forEach(tipo => {
    const listaId = tipo === 'tarefa' ? 'listaTarefas' : 'listaCompras';
    const lista = document.getElementById(listaId);
    Array.from(lista.children).forEach(item => {
      const texto = item.querySelector('.item-conteudo span').textContent;
      const prioridade = parseInt(item.dataset.prioridade);
      const concluido = item.classList.contains('concluido');
      const subtarefas = Array.from(item.querySelectorAll('.subtarefas .subitem')).map(sub => ({
        texto: sub.querySelector('span').textContent,
        concluido: sub.classList.contains('concluido')
      }));
      dados[tipo === 'tarefa' ? 'tarefas' : 'compras'].push({ texto, prioridade, concluido, subtarefas });
    });
  });
  localStorage.setItem('meuBlocoDados', JSON.stringify(dados));
}

// Carregar do localStorage
function carregarDados() {
  const dados = JSON.parse(localStorage.getItem('meuBlocoDados'));
  if (!dados) return;
  const listaTarefas = document.getElementById('listaTarefas');
  const listaCompras = document.getElementById('listaCompras');
  listaTarefas.innerHTML = '';
  listaCompras.innerHTML = '';

  dados.tarefas.forEach(t => {
    const item = criarItem(t.texto, t.prioridade, 'tarefa', t.subtarefas, t.concluido);
    listaTarefas.appendChild(item);
  });

  dados.compras.forEach(c => {
    const item = criarItem(c.texto, c.prioridade, 'compra', c.subtarefas, c.concluido);
    listaCompras.appendChild(item);
  });
}

// Alternar tema claro/escuro
function alternarTema() {
  document.body.classList.toggle('escuro');
  localStorage.setItem('tema', document.body.classList.contains('escuro') ? 'escuro' : 'claro');
}

// Carregar tema salvo
function carregarTema() {
  const tema = localStorage.getItem('tema');
  if (tema === 'escuro') {
    document.body.classList.add('escuro');
  }
}

// Inicialização
window.onload = () => {
  carregarDados();
  carregarTema();
};











