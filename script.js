// ===== Xodozinho Pet Shop — site público =====

// Ano atual no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Menu mobile
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

hamburger.addEventListener('click', () => {
  menu.classList.toggle('aberto');
});

// Fecha o menu ao clicar em um link
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => menu.classList.remove('aberto'));
});
