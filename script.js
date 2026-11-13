/* Top Green Seguros · LP Seguro de Moto (protótipo) */
(function () {
  // Número do WhatsApp da Top Green (DDI+DDD+número, só dígitos). Ainda não informado no briefing.
  const WHATSAPP_NUMBER = '';
  const WHATSAPP_MSG = 'Olá, quero fazer uma cotação de seguro para minha moto!';

  const waLink = (text) => {
    const t = encodeURIComponent(text);
    return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${t}` : `https://api.whatsapp.com/send?text=${t}`;
  };

  document.querySelectorAll('[data-whats]').forEach((a) => { a.href = waLink(WHATSAPP_MSG); });

  // ---------- Marcas e modelos (foco 125 a 300 cc) ----------
  const MOTOS = {
    Honda: ['CG 160 Fan', 'CG 160 Titan', 'CG 160 Start', 'CG 160 Cargo', 'Biz 125', 'Pop 110i', 'Bros 160', 'XRE 190', 'CB 300F Twister', 'XRE 300', 'Elite 125', 'PCX 160', 'Outro modelo Honda'],
    Yamaha: ['Factor 150', 'Fazer FZ15', 'Fazer FZ25', 'NMax 160', 'Crosser 150', 'Lander 250', 'XMax 250', 'Fluo 125', 'Neo 125', 'Outro modelo Yamaha'],
    Suzuki: ['Yes 125', 'Intruder 125', 'Burgman 125', 'Outro modelo Suzuki'],
    Shineray: ['Jet 125', 'Worker 125', 'Phoenix 50', 'Outro modelo Shineray'],
    Haojue: ['DK 150', 'DR 160', 'NK 150', 'Outro modelo Haojue'],
    Dafra: ['Apache 160', 'Citycom 300', 'NH 190', 'Outro modelo Dafra'],
    Outra: ['Outra marca / modelo'],
  };

  const $ = (s, r = document) => r.querySelector(s);
  const marca = $('#marca');
  const modelo = $('#modelo');
  const ano = $('#ano');
  const cep = $('#cep');
  const nome = $('#nome');
  const whats = $('#whats');
  const form = $('#quoteForm');

  Object.keys(MOTOS).forEach((m) => marca.add(new Option(m, m)));
  ano.add(new Option('Selecione', ''));
  for (let y = 2027; y >= 2000; y--) ano.add(new Option(String(y), String(y)));

  marca.addEventListener('change', () => {
    modelo.innerHTML = '';
    if (!marca.value) {
      modelo.add(new Option('Escolha a marca primeiro', ''));
      modelo.disabled = true;
      return;
    }
    modelo.add(new Option('Selecione', ''));
    MOTOS[marca.value].forEach((m) => modelo.add(new Option(m, m)));
    modelo.disabled = false;
    modelo.focus();
  });

  // ---------- Máscaras ----------
  cep.addEventListener('input', () => {
    const d = cep.value.replace(/\D/g, '').slice(0, 8);
    cep.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  });
  whats.addEventListener('input', () => {
    const d = whats.value.replace(/\D/g, '').slice(0, 11);
    let v = d;
    if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    whats.value = v;
  });

  // ---------- Validação ----------
  const rules = {
    marca: (el) => !!el.value,
    modelo: (el) => !!el.value,
    ano: (el) => !!el.value,
    cep: (el) => el.value.replace(/\D/g, '').length === 8,
    nome: (el) => el.value.trim().length >= 2,
    whats: (el) => el.value.replace(/\D/g, '').length >= 10,
  };
  const check = (els) => {
    let ok = true;
    els.forEach((el) => {
      const valid = rules[el.name](el);
      el.closest('.field').classList.toggle('is-invalid', !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    });
    return ok;
  };
  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (f && f.classList.contains('is-invalid') && rules[e.target.name]?.(e.target)) f.classList.remove('is-invalid');
  });

  // ---------- Passos ----------
  const steps = form.querySelectorAll('[data-step]');
  const dots = document.querySelectorAll('[data-step-dot]');
  const go = (n) => {
    steps.forEach((s) => s.classList.toggle('is-active', s.dataset.step === String(n)));
    dots.forEach((d) => d.classList.toggle('is-active', n === 'done' || Number(d.dataset.stepDot) <= Number(n)));
  };
  const motoTxt = () => `${marca.value === 'Outra' ? '' : marca.value + ' '}${modelo.value} ${ano.value}`.trim();

  $('[data-next]').addEventListener('click', () => {
    if (!check([marca, modelo, ano, cep])) return;
    $('#motoSummary').textContent = `🏍️ ${motoTxt()} · CEP ${cep.value}`;
    go(2);
    nome.focus();
  });
  $('[data-prev]').addEventListener('click', () => go(1));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!check([nome, whats])) return;
    const trabalho = $('#trabalho').checked;
    const msg = `${WHATSAPP_MSG}\n\nNome: ${nome.value.trim()}\nMoto: ${motoTxt()}\nCEP: ${cep.value}\nUso: ${trabalho ? 'trabalho (entregas/app)' : 'dia a dia'}`;
    const done = $('.quote__done');
    done.querySelector('[data-nome]').textContent = nome.value.trim().split(' ')[0];
    done.querySelector('[data-moto]').textContent = motoTxt();
    done.querySelector('[data-whats-quote]').href = waLink(msg);
    go('done');
    // Protótipo: aqui entra o envio do lead (CRM / webhook) antes da confirmação.
    setTimeout(() => { done.classList.add('is-ready'); quote.classList.add('is-done'); }, 1600);
  });

  // ---------- Calculadora "a conta da moto" ----------
  const PRECO = 49.9;
  const range = $('#calcEntrega');
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const calc = () => {
    const v = Number(range.value);
    $('#calcValor').textContent = brl(v);
    $('#calcEntregas').textContent = Math.ceil(PRECO / v);
    $('#calcPct').textContent = `${Math.round(((PRECO / 30) / v) * 100)}%`;
    const pct = ((v - range.min) / (range.max - range.min)) * 100;
    range.style.background = `linear-gradient(90deg, #7ec365 ${pct}%, rgba(255,255,255,.2) ${pct}%)`;
  };
  range.addEventListener('input', calc);
  calc();

  // ---------- Barra fixa mobile ----------
  const sticky = $('#stickyCta');
  const quote = $('#cotar');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0))
      .observe(quote);
  }

  // ---------- Marcações do protótipo ----------
  $('[data-toggle-tbc]').addEventListener('click', (e) => {
    const off = document.body.classList.toggle('hide-tbc');
    e.currentTarget.textContent = off ? 'Mostrar marcações' : 'Ocultar marcações';
  });
})();
