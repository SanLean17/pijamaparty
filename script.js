const form = document.getElementById('rsvpForm');
const nameInput = document.getElementById('guestName');
const message = document.getElementById('formMessage');
const app = document.getElementById('app');
const success = document.getElementById('successState');
const successCopy = document.getElementById('successCopy');
const editButton = document.getElementById('editResponse');
const planBChoice = document.getElementById('planBChoice');
const booOverlay = document.getElementById('booOverlay');
const pageShell = document.querySelector('.page-shell');

const STORAGE_KEY = 'pijamaPartyRSVP';
const pollGroups = [...document.querySelectorAll('.poll-group')];

let booTimer;
function triggerBoo() {
  if (!booOverlay) return;
  clearTimeout(booTimer);
  booOverlay.classList.remove('active');
  app.classList.remove('boo-shake');
  void booOverlay.offsetWidth;
  booOverlay.classList.add('active');
  app.classList.add('boo-shake');
  booTimer = setTimeout(() => {
    booOverlay.classList.remove('active');
    app.classList.remove('boo-shake');
  }, 950);
}

planBChoice?.addEventListener('click', triggerBoo);

pollGroups.forEach((group) => {
  const hiddenInput = group.querySelector('input[type="hidden"]');
  const buttons = [...group.querySelectorAll('.choice')];

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      hiddenInput.value = button.dataset.value;
      message.textContent = '';
    });
  });
});

async function saveResponse(response) {
  // Keep a local backup in this visitor's browser.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(response));

  const payload = {
    Nombre: response.name,
    'Se queda a dormir': response.choice === 'Staying over' ? 'Sí' : 'No',
    'Trae neceser': response.toiletryBag === 'Yes' ? 'Sí' : 'No',
    'Tiene colchón o bolsa de dormir': response.sleepGear === 'Yes' ? 'Sí' : 'No',
    'Fecha y hora': new Date(response.submittedAt).toLocaleString('es-AR'),
    _subject: `Pijama Party RSVP — ${response.name}`
  };

  const request = await fetch('https://formspree.io/f/xgavqpev', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!request.ok) {
    throw new Error('Formspree could not save the response.');
  }
}

function showSuccess(response) {
  app.hidden = true;
  success.hidden = false;
  pageShell?.classList.add('success-mode');
  successCopy.textContent = response.choice === 'Staying over'
    ? `${response.name}, anotadísima: te quedás a dormir ✦`
    : `${response.name}, anotadísima: después te volvés a casa ✦`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setGroupValue(groupName, value) {
  const group = document.querySelector(`.poll-group[data-group="${groupName}"]`);
  if (!group) return;

  const input = group.querySelector('input[type="hidden"]');
  const buttons = [...group.querySelectorAll('.choice')];
  input.value = value || '';
  buttons.forEach((button) => {
    const selected = button.dataset.value === value;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const choice = document.getElementById('rsvpChoice').value;
  const toiletryBag = document.getElementById('toiletryBag').value;
  const sleepGear = document.getElementById('sleepGear').value;

  if (!name) {
    message.textContent = 'Escribí tu nombre para poder guardar la respuesta.';
    nameInput.focus();
    return;
  }
  if (!choice) {
    message.textContent = 'Elegí si te quedás a dormir o te volvés a casa.';
    document.querySelector('[data-group="choice"] .choice').focus();
    return;
  }
  if (!toiletryBag) {
    message.textContent = 'Contanos si traés tu neceser.';
    document.querySelector('[data-group="toiletryBag"] .choice').focus();
    return;
  }
  if (!sleepGear) {
    message.textContent = 'Contanos si tenés colchón inflable o bolsa de dormir.';
    document.querySelector('[data-group="sleepGear"] .choice').focus();
    return;
  }

  const response = {
    name,
    choice,
    toiletryBag,
    sleepGear,
    submittedAt: new Date().toISOString()
  };

  const submitButton = form.querySelector('.submit');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'ENVIANDO...';
  message.textContent = '';

  try {
    await saveResponse(response);
    showSuccess(response);
  } catch (error) {
    console.error(error);
    message.textContent = 'No pudimos enviar tu respuesta. Probá de nuevo en unos segundos.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

editButton.addEventListener('click', () => {
  success.hidden = true;
  app.hidden = false;
  pageShell?.classList.remove('success-mode');
  nameInput.focus();
});

const previous = localStorage.getItem(STORAGE_KEY);
if (previous) {
  try {
    const parsed = JSON.parse(previous);
    if (parsed?.name) nameInput.value = parsed.name;
    setGroupValue('choice', parsed?.choice);
    setGroupValue('toiletryBag', parsed?.toiletryBag);
    setGroupValue('sleepGear', parsed?.sleepGear);
  } catch (_) {}
}
