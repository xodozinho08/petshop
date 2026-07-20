// ============================================================
// XODOZINHO PET SHOP — calendário de agendamento
// Mostra um calendário onde só os dias permitidos são clicáveis.
// ============================================================
function criarCalendario(containerId, campoHiddenId, obterDiasPermitidos) {
  const NOMES_MES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const INDICE = { dom:0, seg:1, ter:2, qua:3, qui:4, sex:5, sab:6 };
  const box = document.getElementById(containerId);
  const hidden = document.getElementById(campoHiddenId);
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  let ano = hoje.getFullYear(), mes = hoje.getMonth();
  let selecionado = null;

  function iso(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function render() {
    const permitidos = obterDiasPermitidos().map(d => INDICE[d]);
    const primeiro = new Date(ano, mes, 1);
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const limiteVoltar = (ano === hoje.getFullYear() && mes === hoje.getMonth());

    let html = `
      <div class="cal-topo">
        <button type="button" class="cal-nav" data-nav="-1" ${limiteVoltar ? 'disabled' : ''}>&#8249;</button>
        <span class="cal-mes">${NOMES_MES[mes]} ${ano}</span>
        <button type="button" class="cal-nav" data-nav="1">&#8250;</button>
      </div>
      <div class="cal-grade cal-cab">
        <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
      </div>
      <div class="cal-grade">`;

    for (let i = 0; i < primeiro.getDay(); i++) html += '<span></span>';
    for (let dia = 1; dia <= totalDias; dia++) {
      const data = new Date(ano, mes, dia);
      const dataIso = iso(data);
      const habilitado = data >= hoje && permitidos.includes(data.getDay());
      const sel = selecionado === dataIso ? ' cal-sel' : '';
      html += habilitado
        ? `<button type="button" class="cal-dia${sel}" data-data="${dataIso}">${dia}</button>`
        : `<span class="cal-off">${dia}</span>`;
    }
    html += '</div>';
    box.innerHTML = html;

    box.querySelectorAll('.cal-nav').forEach(b => b.addEventListener('click', () => {
      mes += parseInt(b.dataset.nav, 10);
      if (mes < 0) { mes = 11; ano--; }
      if (mes > 11) { mes = 0; ano++; }
      render();
    }));
    box.querySelectorAll('.cal-dia').forEach(b => b.addEventListener('click', () => {
      selecionado = b.dataset.data;
      hidden.value = selecionado;
      hidden.dispatchEvent(new Event('change'));
      render();
    }));
  }

  render();
  return { atualizar: () => { selecionado = null; hidden.value = ''; render(); } };
}
