// ============================================================
// XODOZINHO PET SHOP — AGENDA PÚBLICA
// Este arquivo controla os dias e horários que aparecem nas
// páginas de agendamento. Ele é atualizado pelo painel admin:
// aba Banhos ou Consultas > "Publicar agenda no site".
// ============================================================
window.XODO_CONFIG = {
  banho: {
    dias: ["ter", "qua", "qui", "sex", "sab"],
    horarios: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    obs: ""
  },
  tosa: {
    dias: ["ter", "qua", "qui", "sex"]
  },
  consulta: {
    dias: ["ter", "qua", "qui", "sex"],
    horarios: ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    obs: "10:00 às 16:00 horas"
  }
};
