// ============================================================
// XODOZINHO PET SHOP — Painel Administrativo
// Dados salvos no localStorage do navegador.
// ============================================================

// ---------- LOGIN ----------
// ATENÇÃO: este login é uma proteção simples de acesso (site estático,
// sem servidor). Não guarde informações sigilosas de terceiros aqui.
const ADMIN_EMAIL = 'maisapimentelbarros1401@gmail.com';
const ADMIN_SENHA = '123456';
// Login da veterinária (acesso só à aba Consultas) — troque aqui se quiser:
const VET_EMAIL = 'veterinaria@xodozinho.com';
const VET_SENHA = 'vet123';
const CHAVE_SESSAO = 'xodozinho_logado';
const CHAVE_PAPEL = 'xodozinho_papel';
const CHAVE_DADOS = 'xodozinho_dados';

const telaLogin = document.getElementById('telaLogin');
const painel = document.getElementById('painel');

function estaLogado() {
  return sessionStorage.getItem(CHAVE_SESSAO) === 'sim';
}

function papelAtual() {
  return sessionStorage.getItem(CHAVE_PAPEL) || 'admin';
}

function aplicarPapel() {
  if (papelAtual() !== 'vet') return;
  // Vet só vê a aba Consultas
  document.querySelectorAll('.aba').forEach(a => {
    const ehConsultas = a.dataset.aba === 'consultas';
    a.style.display = ehConsultas ? '' : 'none';
    a.classList.toggle('ativa', ehConsultas);
  });
  document.querySelectorAll('.painel-secao').forEach(s => {
    s.classList.toggle('ativa', s.id === 'sec-consultas');
  });
}

function mostrarPainel() {
  telaLogin.hidden = true;
  telaLogin.style.display = 'none';
  painel.hidden = false;
  renderizarTudo();
  aplicarPapel();
}

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const senha = document.getElementById('loginSenha').value;
  const erro = document.getElementById('loginErro');
  if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
    sessionStorage.setItem(CHAVE_SESSAO, 'sim');
    sessionStorage.setItem(CHAVE_PAPEL, 'admin');
    erro.classList.remove('visivel');
    mostrarPainel();
  } else if (email === VET_EMAIL && senha === VET_SENHA) {
    sessionStorage.setItem(CHAVE_SESSAO, 'sim');
    sessionStorage.setItem(CHAVE_PAPEL, 'vet');
    erro.classList.remove('visivel');
    mostrarPainel();
  } else {
    erro.classList.add('visivel');
  }
});

document.getElementById('btnSair').addEventListener('click', () => {
  sessionStorage.removeItem(CHAVE_SESSAO);
  location.reload();
});

if (estaLogado()) mostrarPainel();

// ---------- DADOS ----------
function carregarDados() {
  try {
    const bruto = localStorage.getItem(CHAVE_DADOS);
    if (bruto) return JSON.parse(bruto);
  } catch (e) { console.error('Erro ao ler dados', e); }
  return { entradas: [], saidas: [], boletos: [], clientes: [], pacotes: [], consultas: [], banhos: [], diasVet: { dias: [], obs: '' } };
}

let dados = carregarDados();

function salvar() {
  localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- UTILITÁRIOS ----------
function real(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dataBR(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function mesDe(iso) { return iso ? iso.slice(0, 7) : ''; }

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const NOMES_MES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function nomeMes(am) {
  const [ano, mes] = am.split('-');
  return `${NOMES_MES[parseInt(mes, 10) - 1]} / ${ano}`;
}

// ---------- ABAS ----------
document.getElementById('abas').addEventListener('click', (e) => {
  const btn = e.target.closest('.aba');
  if (!btn) return;
  document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativa'));
  document.querySelectorAll('.painel-secao').forEach(s => s.classList.remove('ativa'));
  btn.classList.add('ativa');
  document.getElementById('sec-' + btn.dataset.aba).classList.add('ativa');
});

// ---------- ENTRADAS ----------
const formEntrada = document.getElementById('formEntrada');
document.getElementById('entData').value = hojeISO();
document.getElementById('mesEntradas').value = mesAtual();

formEntrada.addEventListener('submit', (e) => {
  e.preventDefault();
  dados.entradas.push({
    id: novoId(),
    origem: document.getElementById('entOrigem').value,
    forma: document.getElementById('entForma').value,
    valor: parseFloat(document.getElementById('entValor').value),
    data: document.getElementById('entData').value
  });
  salvar();
  document.getElementById('entValor').value = '';
  renderizarTudo();
});

document.getElementById('mesEntradas').addEventListener('change', renderizarEntradas);

function renderizarEntradas() {
  const mes = document.getElementById('mesEntradas').value;
  const tbody = document.getElementById('tbodyEntradas');
  const lista = dados.entradas
    .filter(x => !mes || mesDe(x.data) === mes)
    .sort((a, b) => b.data.localeCompare(a.data));

  const total = lista.reduce((s, x) => s + x.valor, 0);
  document.getElementById('totalEntradas').textContent = 'Total: ' + real(total);

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="4">Nenhuma entrada neste mês. Lance a primeira acima! &#128062;</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(x => `
    <tr>
      <td>${x.origem} (${x.forma})</td>
      <td class="valor-pos">${real(x.valor)}</td>
      <td>${dataBR(x.data)}</td>
      <td><button class="acao" data-del-entrada="${x.id}" title="Excluir">&#10060;</button></td>
    </tr>`).join('');
}

// ---------- SAÍDAS ----------
const formSaida = document.getElementById('formSaida');
document.getElementById('saiData').value = hojeISO();
document.getElementById('mesSaidas').value = mesAtual();

formSaida.addEventListener('submit', (e) => {
  e.preventDefault();
  dados.saidas.push({
    id: novoId(),
    desc: document.getElementById('saiDesc').value.trim(),
    valor: parseFloat(document.getElementById('saiValor').value),
    data: document.getElementById('saiData').value,
    status: document.getElementById('saiStatus').value
  });
  salvar();
  document.getElementById('saiDesc').value = '';
  document.getElementById('saiValor').value = '';
  renderizarTudo();
});

document.getElementById('mesSaidas').addEventListener('change', renderizarSaidas);

function renderizarSaidas() {
  const mes = document.getElementById('mesSaidas').value;
  const tbody = document.getElementById('tbodySaidas');
  const lista = dados.saidas
    .filter(x => !mes || mesDe(x.data) === mes)
    .sort((a, b) => b.data.localeCompare(a.data));

  const total = lista.reduce((s, x) => s + x.valor, 0);
  document.getElementById('totalSaidas').textContent = 'Total: ' + real(total);

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="5">Nenhuma saída neste mês.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(x => `
    <tr>
      <td>${x.desc}</td>
      <td><span class="tag ${x.status === 'PG' ? 'tag-pg' : 'tag-pend'}">${x.status}</span></td>
      <td class="valor-neg">${real(x.valor)}</td>
      <td>${dataBR(x.data)}</td>
      <td>
        ${x.status !== 'PG' ? `<button class="acao" data-pagar-saida="${x.id}" title="Marcar como pago">&#9989;</button>` : ''}
        <button class="acao" data-del-saida="${x.id}" title="Excluir">&#10060;</button>
      </td>
    </tr>`).join('');
}

// ---------- BOLETOS ----------
const formBoleto = document.getElementById('formBoleto');

formBoleto.addEventListener('submit', (e) => {
  e.preventDefault();
  dados.boletos.push({
    id: novoId(),
    desc: document.getElementById('bolDesc').value.trim(),
    valor: parseFloat(document.getElementById('bolValor').value),
    venc: document.getElementById('bolData').value,
    status: 'ABERTO'
  });
  salvar();
  formBoleto.reset();
  renderizarTudo();
});

function renderizarBoletos() {
  const tbody = document.getElementById('tbodyBoletos');
  const lista = [...dados.boletos].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ABERTO' ? -1 : 1;
    return a.venc.localeCompare(b.venc);
  });

  const totalAberto = lista.filter(x => x.status === 'ABERTO').reduce((s, x) => s + x.valor, 0);
  document.getElementById('totalBoletos').textContent = 'Em aberto: ' + real(totalAberto);

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="5">Nenhum boleto cadastrado.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(x => `
    <tr>
      <td>${x.desc}</td>
      <td><span class="tag ${x.status === 'PG' ? 'tag-pg' : 'tag-aberto'}">${x.status}</span></td>
      <td class="${x.status === 'PG' ? '' : 'valor-neg'}">${real(x.valor)}</td>
      <td>${dataBR(x.venc)}</td>
      <td>
        ${x.status === 'ABERTO' ? `<button class="acao" data-pagar-boleto="${x.id}" title="Marcar como pago (vira saída)">&#9989;</button>` : ''}
        <button class="acao" data-del-boleto="${x.id}" title="Excluir">&#10060;</button>
      </td>
    </tr>`).join('');
}

// ---------- CLIENTES ----------
const formCliente = document.getElementById('formCliente');

formCliente.addEventListener('submit', (e) => {
  e.preventDefault();
  dados.clientes.push({
    id: novoId(),
    nome: document.getElementById('cliNome').value.trim(),
    pet: document.getElementById('cliPet').value.trim(),
    tel: document.getElementById('cliTel').value.trim(),
    obs: document.getElementById('cliObs').value.trim()
  });
  salvar();
  formCliente.reset();
  renderizarClientes();
});

document.getElementById('buscaCliente').addEventListener('input', renderizarClientes);

function renderizarClientes() {
  const busca = document.getElementById('buscaCliente').value.trim().toLowerCase();
  const tbody = document.getElementById('tbodyClientes');
  const lista = dados.clientes
    .filter(c => !busca || c.nome.toLowerCase().includes(busca) || c.pet.toLowerCase().includes(busca))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  document.getElementById('totalClientes').textContent = dados.clientes.length + ' cadastrados';

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="5">Nenhum cliente encontrado.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(c => {
    const numeroLimpo = c.tel.replace(/\D/g, '');
    const zap = numeroLimpo
      ? `<a class="link-zap" target="_blank" rel="noopener" href="https://wa.me/55${numeroLimpo}">${c.tel}</a>`
      : '—';
    return `
    <tr>
      <td>${c.nome}</td>
      <td>${c.pet}</td>
      <td>${zap}</td>
      <td>${c.obs || '—'}</td>
      <td><button class="acao" data-del-cliente="${c.id}" title="Excluir">&#10060;</button></td>
    </tr>`;
  }).join('');
}

// ---------- PACOTES ----------
const formPacote = document.getElementById('formPacote');

formPacote.addEventListener('submit', (e) => {
  e.preventDefault();
  dados.pacotes.push({
    id: novoId(),
    cliente: document.getElementById('pacCliente').value.trim(),
    tipo: document.getElementById('pacTipo').value,
    valor: parseFloat(document.getElementById('pacValor').value),
    sessoes: parseInt(document.getElementById('pacSessoes').value, 10),
    usadas: 0
  });
  salvar();
  formPacote.reset();
  document.getElementById('pacSessoes').value = 4;
  renderizarPacotes();
});

function renderizarPacotes() {
  const tbody = document.getElementById('tbodyPacotes');
  const ativos = dados.pacotes.filter(p => p.usadas < p.sessoes).length;
  document.getElementById('totalPacotes').textContent = ativos + ' ativos';

  if (!dados.pacotes.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="5">Nenhum pacote contratado ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = dados.pacotes.map(p => {
    const bolinhas = Array.from({ length: p.sessoes }, (_, i) =>
      `<span class="bolinha ${i < p.usadas ? 'usada' : ''}"></span>`).join('');
    const completo = p.usadas >= p.sessoes;
    return `
    <tr>
      <td>${p.cliente}</td>
      <td>${p.tipo}</td>
      <td>${real(p.valor)}</td>
      <td>
        <span class="sessoes">${bolinhas} ${p.usadas}/${p.sessoes}</span>
        ${completo
          ? '<span class="pacote-completo"> &#10003; concluído</span>'
          : `<button class="btn-sessao" data-usar-sessao="${p.id}">usar sessão</button>`}
      </td>
      <td><button class="acao" data-del-pacote="${p.id}" title="Excluir">&#10060;</button></td>
    </tr>`;
  }).join('');
}

// ---------- BANHOS ----------
const formBanho = document.getElementById('formBanho');
document.getElementById('banData').value = hojeISO();
document.getElementById('mesBanhos').value = mesAtual();
document.getElementById('mesBanhos').addEventListener('change', renderizarBanhos);

formBanho.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!dados.banhos) dados.banhos = [];
  const pacoteId = document.getElementById('banPacote').value;
  if (pacoteId) {
    const p = dados.pacotes.find(x => x.id === pacoteId);
    if (!p) { alert('Pacote n\u00e3o encontrado.'); return; }
    if (p.usadas >= p.sessoes) { alert('Este pacote j\u00e1 usou todas as sess\u00f5es.'); return; }
    p.usadas++;
  }
  dados.banhos.push({
    id: novoId(),
    cliente: document.getElementById('banCliente').value.trim(),
    data: document.getElementById('banData').value,
    pacoteId: pacoteId || null,
    obs: document.getElementById('banObs').value.trim()
  });
  salvar();
  document.getElementById('banCliente').value = '';
  document.getElementById('banObs').value = '';
  renderizarTudo();
});

// Ao escolher um pacote, preenche o cliente automaticamente
document.getElementById('banPacote').addEventListener('change', (e) => {
  const p = dados.pacotes.find(x => x.id === e.target.value);
  if (p) document.getElementById('banCliente').value = p.cliente;
});

function renderizarBanhos() {
  if (!dados.banhos) dados.banhos = [];

  // Select de pacotes ativos
  const sel = document.getElementById('banPacote');
  const valorAtual = sel.value;
  sel.innerHTML = '<option value="">Avulso (fora de pacote)</option>' +
    dados.pacotes.filter(p => p.usadas < p.sessoes)
      .map(p => `<option value="${p.id}">Pacote: ${p.cliente} \u2014 ${p.tipo} (${p.usadas}/${p.sessoes})</option>`).join('');
  if ([...sel.options].some(o => o.value === valorAtual)) sel.value = valorAtual;

  const mes = document.getElementById('mesBanhos').value;
  const tbody = document.getElementById('tbodyBanhos');
  const lista = dados.banhos
    .filter(x => !mes || mesDe(x.data) === mes)
    .sort((a, b) => b.data.localeCompare(a.data));

  document.getElementById('totalBanhos').textContent = lista.length + ' no m\u00eas';

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="5">Nenhum banho registrado neste m\u00eas. &#128703;</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(b => {
    const p = b.pacoteId ? dados.pacotes.find(x => x.id === b.pacoteId) : null;
    const tipo = p ? `<span class="tag tag-pg">Pacote ${p.tipo}</span>` : '<span class="tag tag-pend">Avulso</span>';
    return `
    <tr>
      <td><strong>${dataBR(b.data)}</strong></td>
      <td>${b.cliente}</td>
      <td>${tipo}</td>
      <td>${b.obs || '\u2014'}</td>
      <td><button class="acao" data-del-banho="${b.id}" title="Excluir">&#10060;</button></td>
    </tr>`;
  }).join('');
}

// ---------- CONSULTAS VETERINÁRIAS ----------
const formConsulta = document.getElementById('formConsulta');
document.getElementById('conData').value = hojeISO();

// Salvar dias de atendimento
document.getElementById('btnSalvarDias').addEventListener('click', () => {
  const marcados = [...document.querySelectorAll('#diasSemana input:checked')].map(c => c.value);
  dados.diasVet = { dias: marcados, obs: document.getElementById('obsVet').value.trim() };
  salvar();
  const ok = document.getElementById('diasSalvos');
  ok.hidden = false;
  setTimeout(() => { ok.hidden = true; }, 2500);
  atualizarLinkAgenda();
});

function atualizarLinkAgenda() {
  const base = location.href.replace(/admin\.html.*$/, 'consulta.html');
  const dias = (dados.diasVet && dados.diasVet.dias.length) ? dados.diasVet.dias.join(',') : '';
  const obs = (dados.diasVet && dados.diasVet.obs) ? dados.diasVet.obs : '';
  let link = base;
  const params = [];
  if (dias) params.push('dias=' + dias);
  if (obs) params.push('obs=' + encodeURIComponent(obs));
  if (params.length) link += '?' + params.join('&');
  document.getElementById('linkAgenda').value = link;
}

document.getElementById('btnCopiarLink').addEventListener('click', () => {
  const campo = document.getElementById('linkAgenda');
  campo.select();
  navigator.clipboard.writeText(campo.value).then(() => {
    const btn = document.getElementById('btnCopiarLink');
    const txt = btn.textContent;
    btn.textContent = '\u2713 Copiado!';
    setTimeout(() => { btn.textContent = txt; }, 2000);
  }).catch(() => { document.execCommand('copy'); });
});

formConsulta.addEventListener('submit', (e) => {
  e.preventDefault();
  dados.consultas.push({
    id: novoId(),
    cliente: document.getElementById('conCliente').value.trim(),
    tel: document.getElementById('conTel').value.trim(),
    data: document.getElementById('conData').value,
    hora: document.getElementById('conHora').value,
    motivo: document.getElementById('conMotivo').value.trim()
  });
  salvar();
  formConsulta.reset();
  document.getElementById('conData').value = hojeISO();
  renderizarConsultas();
});

function renderizarConsultas() {
  if (!dados.consultas) dados.consultas = [];
  if (!dados.diasVet) dados.diasVet = { dias: [], obs: '' };

  // Preencher dias salvos
  document.querySelectorAll('#diasSemana input').forEach(c => {
    c.checked = dados.diasVet.dias.includes(c.value);
  });
  document.getElementById('obsVet').value = dados.diasVet.obs || '';
  atualizarLinkAgenda();

  const tbody = document.getElementById('tbodyConsultas');
  const hoje = hojeISO();
  const lista = [...dados.consultas].sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora));

  const futuras = lista.filter(c => c.data >= hoje).length;
  document.getElementById('totalConsultas').textContent = futuras + ' agendadas';

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="6">Nenhuma consulta agendada ainda. &#129658;</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(c => {
    const numeroLimpo = (c.tel || '').replace(/\D/g, '');
    const zap = numeroLimpo
      ? `<a class="link-zap" target="_blank" rel="noopener" href="https://wa.me/55${numeroLimpo}">${c.tel}</a>`
      : '—';
    const passada = c.data < hoje;
    return `
    <tr${passada ? ' style="opacity:.55"' : ''}>
      <td><strong>${dataBR(c.data)}</strong></td>
      <td>${c.hora}</td>
      <td>${c.cliente}</td>
      <td>${zap}</td>
      <td>${c.motivo || '—'}</td>
      <td><button class="acao" data-del-consulta="${c.id}" title="Excluir">&#10060;</button></td>
    </tr>`;
  }).join('');
}

// ---------- RESUMO (DASHBOARD) ----------
document.getElementById('mesResumo').value = mesAtual();
document.getElementById('mesResumo').addEventListener('change', renderizarResumo);

function renderizarResumo() {
  const mes = document.getElementById('mesResumo').value || mesAtual();

  const entradasMes = dados.entradas.filter(x => mesDe(x.data) === mes);
  const saidasMes = dados.saidas.filter(x => mesDe(x.data) === mes);
  const abertos = dados.boletos.filter(x => x.status === 'ABERTO');

  const totalEnt = entradasMes.reduce((s, x) => s + x.valor, 0);
  const totalSai = saidasMes.reduce((s, x) => s + x.valor, 0);
  const totalBol = abertos.reduce((s, x) => s + x.valor, 0);
  const saldo = totalEnt - totalSai;

  document.getElementById('kpiEntradas').textContent = real(totalEnt);
  document.getElementById('kpiSaidas').textContent = real(totalSai);
  document.getElementById('kpiBoletos').textContent = real(totalBol);
  const kpiSaldo = document.getElementById('kpiSaldo');
  kpiSaldo.textContent = real(saldo);
  kpiSaldo.style.color = saldo >= 0 ? 'var(--verde)' : 'var(--vermelho)';

  // Gráfico: entradas por forma de pagamento
  const formas = { pix: 0, dinheiro: 0, debito: 0, credito: 0 };
  entradasMes.forEach(x => { formas[x.forma] = (formas[x.forma] || 0) + x.valor; });
  const maior = Math.max(...Object.values(formas), 1);
  document.getElementById('graficoFormas').innerHTML =
    Object.entries(formas).map(([nome, valor]) => `
      <div class="barra-linha">
        <span class="barra-nome">${nome}</span>
        <div class="barra-trilha"><div class="barra-preench" style="width:${(valor / maior * 100).toFixed(1)}%"></div></div>
        <span class="barra-valor">${real(valor)}</span>
      </div>`).join('');

  // Próximos vencimentos
  const hoje = hojeISO();
  const proximos = abertos.sort((a, b) => a.venc.localeCompare(b.venc)).slice(0, 6);
  document.getElementById('listaVencimentos').innerHTML = proximos.length
    ? proximos.map(b => `
        <div class="item ${b.venc <= hoje ? 'venc-perto' : ''}">
          <span>${b.desc}</span>
          <span><strong>${real(b.valor)}</strong> — ${dataBR(b.venc)}</span>
        </div>`).join('')
    : '<p class="vazio">Nenhum boleto em aberto. &#127881;</p>';
}

// ---------- FECHAMENTOS ----------
function renderizarFechamentos() {
  const tbody = document.getElementById('tbodyFechamentos');
  const meses = new Set([
    ...dados.entradas.map(x => mesDe(x.data)),
    ...dados.saidas.map(x => mesDe(x.data))
  ]);
  const lista = [...meses].filter(Boolean).sort().reverse();

  if (!lista.length) {
    tbody.innerHTML = '<tr class="linha-vazia"><td colspan="4">Os fechamentos aparecem aqui conforme você lança entradas e saídas.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(mes => {
    const ent = dados.entradas.filter(x => mesDe(x.data) === mes).reduce((s, x) => s + x.valor, 0);
    const sai = dados.saidas.filter(x => mesDe(x.data) === mes).reduce((s, x) => s + x.valor, 0);
    const saldo = ent - sai;
    return `
    <tr>
      <td><strong>${nomeMes(mes)}</strong></td>
      <td class="valor-pos">${real(ent)}</td>
      <td class="valor-neg">- ${real(sai)}</td>
      <td class="${saldo >= 0 ? 'saldo-pos' : 'saldo-neg'}">${real(saldo)}</td>
    </tr>`;
  }).join('');
}

// ---------- AÇÕES NAS TABELAS (delegação) ----------
document.querySelector('.conteudo').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const d = btn.dataset;

  if (d.delEntrada && confirm('Excluir esta entrada?')) {
    dados.entradas = dados.entradas.filter(x => x.id !== d.delEntrada);
  } else if (d.delSaida && confirm('Excluir esta saída?')) {
    dados.saidas = dados.saidas.filter(x => x.id !== d.delSaida);
  } else if (d.pagarSaida) {
    const s = dados.saidas.find(x => x.id === d.pagarSaida);
    if (s) s.status = 'PG';
  } else if (d.delBoleto && confirm('Excluir este boleto?')) {
    dados.boletos = dados.boletos.filter(x => x.id !== d.delBoleto);
  } else if (d.pagarBoleto) {
    const b = dados.boletos.find(x => x.id === d.pagarBoleto);
    if (b && confirm(`Marcar "${b.desc}" como pago?\nEle também será lançado como saída de hoje.`)) {
      b.status = 'PG';
      dados.saidas.push({ id: novoId(), desc: b.desc, valor: b.valor, data: hojeISO(), status: 'PG' });
    }
  } else if (d.delCliente && confirm('Excluir este cliente?')) {
    dados.clientes = dados.clientes.filter(x => x.id !== d.delCliente);
  } else if (d.usarSessao) {
    const p = dados.pacotes.find(x => x.id === d.usarSessao);
    if (p && p.usadas < p.sessoes) p.usadas++;
  } else if (d.delPacote && confirm('Excluir este pacote?')) {
    dados.pacotes = dados.pacotes.filter(x => x.id !== d.delPacote);
  } else if (d.delConsulta && confirm('Excluir esta consulta?')) {
    dados.consultas = dados.consultas.filter(x => x.id !== d.delConsulta);
  } else if (d.delBanho && confirm('Excluir este banho? Se for de pacote, a sess\u00e3o volta.')) {
    const b = dados.banhos.find(x => x.id === d.delBanho);
    if (b && b.pacoteId) {
      const p = dados.pacotes.find(x => x.id === b.pacoteId);
      if (p && p.usadas > 0) p.usadas--;
    }
    dados.banhos = dados.banhos.filter(x => x.id !== d.delBanho);
  } else if (d.statusPacote) {
    const p = dados.pacotes.find(x => x.id === d.statusPacote);
    if (p) {
      const datas = (dados.banhos || []).filter(b => b.pacoteId === p.id)
        .sort((a, b2) => a.data.localeCompare(b2.data)).map(b => dataBR(b.data));
      const texto = `\u{1F43E} *Xodozinho Pet Shop \u2014 Acompanhamento do Pacote*%0A%0A` +
        `Cliente: ${encodeURIComponent(p.cliente)}%0A` +
        `Pacote: ${encodeURIComponent(p.tipo)}%0A` +
        `Banhos usados: ${p.usadas} de ${p.sessoes}%0A` +
        (datas.length ? `Datas: ${encodeURIComponent(datas.join(', '))}%0A` : '') +
        `%0ACarinho, cuidado e amor pelo seu melhor amigo! \u{1F49C}`;
      window.open('https://wa.me/?text=' + texto, '_blank');
    }
  } else {
    return; // nenhum botão de ação conhecido
  }
  salvar();
  renderizarTudo();
});

// ---------- BACKUP ----------
document.getElementById('btnExportarJSON').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  baixar(blob, `xodozinho-backup-${hojeISO()}.json`);
});

document.getElementById('btnExportarCSV').addEventListener('click', () => {
  const linhas = ['TIPO;DESCRICAO;STATUS;VALOR;DATA'];
  dados.entradas.forEach(x =>
    linhas.push(`ENTRADA;${x.origem} (${x.forma});;${String(x.valor).replace('.', ',')};${dataBR(x.data)}`));
  dados.saidas.forEach(x =>
    linhas.push(`SAIDA;${x.desc};${x.status};${String(x.valor).replace('.', ',')};${dataBR(x.data)}`));
  dados.boletos.forEach(x =>
    linhas.push(`BOLETO;${x.desc};${x.status};${String(x.valor).replace('.', ',')};${dataBR(x.venc)}`));
  const blob = new Blob(['\uFEFF' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  baixar(blob, `xodozinho-lancamentos-${hojeISO()}.csv`);
});

document.getElementById('inputImportar').addEventListener('change', (e) => {
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const novo = JSON.parse(leitor.result);
      if (!novo.entradas || !novo.saidas) throw new Error('formato inválido');
      if (confirm('Restaurar este backup? Os dados atuais serão substituídos.')) {
        dados = {
          entradas: novo.entradas || [],
          saidas: novo.saidas || [],
          boletos: novo.boletos || [],
          clientes: novo.clientes || [],
          pacotes: novo.pacotes || [],
          consultas: novo.consultas || [],
          banhos: novo.banhos || [],
          diasVet: novo.diasVet || { dias: [], obs: '' }
        };
        salvar();
        renderizarTudo();
        alert('Backup restaurado com sucesso!');
      }
    } catch (err) {
      alert('Arquivo inválido. Use um backup .json gerado por este painel.');
    }
    e.target.value = '';
  };
  leitor.readAsText(arquivo);
});

document.getElementById('btnLimparTudo').addEventListener('click', () => {
  if (confirm('Tem certeza? TODOS os lançamentos, clientes e pacotes serão apagados.') &&
      confirm('Última confirmação: essa ação não pode ser desfeita. Baixou o backup?')) {
    dados = { entradas: [], saidas: [], boletos: [], clientes: [], pacotes: [], consultas: [], banhos: [], diasVet: { dias: [], obs: '' } };
    salvar();
    renderizarTudo();
  }
});

function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- RENDERIZAR TUDO ----------
function renderizarTudo() {
  renderizarResumo();
  renderizarEntradas();
  renderizarSaidas();
  renderizarBoletos();
  renderizarClientes();
  renderizarPacotes();
  renderizarBanhos();
  renderizarConsultas();
  renderizarFechamentos();
}
