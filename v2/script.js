/* Top Green Seguros · LP Seguro de Moto (protótipo) */
(function () {
  // Número do WhatsApp da Top Green (DDI+DDD+número, só dígitos). Pendente: [INSERIR NÚMERO] na copy.
  const WHATSAPP_NUMBER = '';
  const WHATSAPP_MSG = 'Olá, quero fazer uma cotação de seguro para minha moto!';

  const waLink = (text) => {
    const t = encodeURIComponent(text);
    return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${t}` : `https://api.whatsapp.com/send?text=${t}`;
  };

  document.querySelectorAll('[data-whats]').forEach((a) => { a.href = waLink(WHATSAPP_MSG); });

  // ---------- Marcas e modelos (foco 125 a 300 cc) ----------
  const MOTOS = {
    Honda: ['CG 160 Fan', 'CG 160 Titan', 'CG 160 Start', 'CG 160 Cargo', 'Biz 125', 'Pop 110i', 'Bros 160', 'XRE 190', 'CB 300F Twister', 'XRE 300', 'Elite 125', 'PCX 160', 'Outro modelo'],
    Yamaha: ['Factor 150', 'Fazer FZ15', 'Fazer FZ25', 'NMax 160', 'Crosser 150', 'Lander 250', 'XMax 250', 'Fluo 125', 'Neo 125', 'Outro modelo'],
    Suzuki: ['Yes 125', 'Intruder 125', 'Burgman 125', 'Outro modelo'],
    Shineray: ['Jet 125', 'Worker 125', 'Phoenix 50', 'Outro modelo'],
    Haojue: ['DK 150', 'DR 160', 'NK 150', 'Outro modelo'],
    Dafra: ['Apache 160', 'Citycom 300', 'NH 190', 'Outro modelo'],
    Outra: ['Outro modelo'],
  };

  const $ = (s, r = document) => r.querySelector(s);
  const nome = $('#nome');
  const whats = $('#whats');
  const marca = $('#marca');
  const modelo = $('#modelo');
  const ano = $('#ano');
  const form = $('#quoteForm');
  const quote = $('#cotar');

  Object.keys(MOTOS).forEach((m) => marca.add(new Option(m, m)));
  ano.add(new Option('Selecione', ''));
  for (let y = 2027; y >= 2000; y--) ano.add(new Option(String(y), String(y)));

  marca.addEventListener('change', () => {
    modelo.innerHTML = '';
    modelo.add(new Option('Selecione', ''));
    if (!marca.value) { modelo.disabled = true; return; }
    MOTOS[marca.value].forEach((m) => modelo.add(new Option(m, m)));
    modelo.disabled = false;
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
    nome: (el) => el.value.trim().length >= 2,
    whats: (el) => el.value.replace(/\D/g, '').length >= 10,
    marca: (el) => !!el.value,
    modelo: (el) => !!el.value,
    ano: (el) => !!el.value,
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
  form.addEventListener('change', (e) => {
    const f = e.target.closest('.field');
    if (f && f.classList.contains('is-invalid') && rules[e.target.name]?.(e.target)) f.classList.remove('is-invalid');
  });

  const motoTxt = () => `${marca.value === 'Outra' ? '' : marca.value + ' '}${modelo.value} ${ano.value}`.trim();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!check([nome, whats, marca, modelo, ano])) return;
    const msg = `${WHATSAPP_MSG}\n\nNome: ${nome.value.trim()}\nMoto: ${motoTxt()}`;
    const done = $('.quote__done');
    done.querySelector('[data-nome]').textContent = nome.value.trim().split(' ')[0];
    done.querySelector('[data-moto]').textContent = motoTxt();
    done.querySelector('[data-whats-quote]').href = waLink(msg);
    $('.quote__fields').hidden = true;
    done.classList.add('is-active');
    // Protótipo: aqui entra o envio do lead (CRM / webhook) antes da confirmação.
    setTimeout(() => { done.classList.add('is-ready'); quote.classList.add('is-done'); }, 1400);
  });

  // ---------- Barra fixa mobile ----------
  const sticky = $('#stickyCta');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0))
      .observe(quote);
  }
})();
