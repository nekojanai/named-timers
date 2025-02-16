import './style.css'
import { createElement, genFile, genUUID, getTimeDiffHumanReadable } from './utils';

const timerTableElement = document.querySelector<HTMLTableElement>('#timer-table')!;
const timerTableTBodyElement = timerTableElement.tBodies[0]!;
const createTimerFormElement = document.querySelector<HTMLFormElement>('#create-timer-form')!;
const createTimerNameInputElement = document.querySelector<HTMLInputElement>('#create-timer-name-input')!;
const createTimerSubmitButtonElement = document.querySelector<HTMLButtonElement>('#create-timer-submit-button')!;

type TaskTimerStrings = {
  id: string,
  name: string,
  createdAt: string,
  pausedAt: string | null
}

type TaskTimer = {
  id: string,
  name: string,
  createdAt: Date,
  pausedAt: Date | null
}

const createNewTimer = (name: string) => {
  const savedTimers = retrieveSavedTimers();
  savedTimers.push({ id: genUUID(), name, createdAt: new Date(), pausedAt: null });
  saveTimers(savedTimers);
  timers = savedTimers;
  updateTimerTable();
};

const modifyTimer = (timer: TaskTimer) => {
  const savedTimers = retrieveSavedTimers();
  const foundTimerIndex = savedTimers.findIndex((savedTimer) => savedTimer.id === timer.id);
  if (foundTimerIndex === -1) return;
  savedTimers[foundTimerIndex] = timer; 
  saveTimers(savedTimers);
  timers = savedTimers;
  updateTimerTable();
}

const removeTimer = (timer: TaskTimer) => {
  const savedTimers = retrieveSavedTimers();
  const foundTimerIndex = savedTimers.findIndex((savedTimer) => savedTimer.id === timer.id);
  if (foundTimerIndex === -1) return;
  savedTimers[foundTimerIndex] = undefined as unknown as TaskTimer;
  const savedTimersFiltered = savedTimers.filter((v) => v);
  saveTimers(savedTimersFiltered);
  timers = savedTimersFiltered;
  updateTimerTable();
}

function addTimerToTable(timer: TaskTimer) {
   const rowElement = createElement('tr', {
    innerHTML: `<td class="timer-table-name-col">${timer.name}</td>`
  });
  const timerColumnElement = createElement('td', {
    innerHTML: `started: ${timer.createdAt.toUTCString()}<br>${timer.pausedAt?.toUTCString() ? 'stopped: '+timer.pausedAt.toUTCString() : ''}`
  });
  timerColumnElement.classList.add('timer-table-timer-col')
  rowElement.append(timerColumnElement);
  if (timer.pausedAt === null) {
    setInterval(()=>{
      timerColumnElement.innerHTML = `started: ${timer.createdAt.toUTCString()}<br>${timer.pausedAt?.toUTCString() ? 'stopped: '+timer.pausedAt.toUTCString() : getTimeDiffHumanReadable(new Date(), timer.createdAt)}`
    }, 1000);
  }
  const actionColumn = createElement('td', {});
  const pauseButton = createElement('button', {
    innerHTML: 'STOP',
  });
  pauseButton.onclick = () => pauseTimer(timer);
  if (timer.pausedAt !== null) {
    const removeButton = createElement('button', {
      innerText: 'REMOVE'
    });
    removeButton.onclick = () => removeTimer(timer);
    actionColumn.append(removeButton);
  } else {
    actionColumn.append(pauseButton);
  }
  rowElement.append(actionColumn);
  timerTableTBodyElement.append(rowElement);
}

function pauseTimer(timer: TaskTimer) {
  modifyTimer({
    ...timer,
    pausedAt: new Date()
  });
}

function addEmptyInfoRow() {
  timerTableTBodyElement.append(createElement('tr', {
    innerHTML: `<td colspan="3">- 0 timers -</td>`
  }));
}

createTimerSubmitButtonElement.onclick = (event) => {
  event.preventDefault();
  const formData = new FormData(createTimerFormElement, createTimerSubmitButtonElement);
  const formDataAsObject = Object.fromEntries(formData.entries()) as { name: string };
  createNewTimer(formDataAsObject.name);
  clearInputAndDisabledSubmit();
};

function clearInputAndDisabledSubmit() {
  createTimerNameInputElement.value = '';
  createTimerSubmitButtonElement.disabled = !createTimerSubmitButtonElement.disabled;
}

function taskTimerStringsToTaskTimer(timer: TaskTimerStrings): TaskTimer {
  return {
    ...timer,
    createdAt: new Date(timer.createdAt),
    pausedAt: timer.pausedAt ? new Date(timer.pausedAt) : null
  }
}

function retrieveSavedTimers(): TaskTimer[] {
  const stringifiedSavedTimers = localStorage.getItem('timers')
  if (!stringifiedSavedTimers) return [];
  const taskTimerWithoutParsedDates = (JSON.parse(stringifiedSavedTimers) as TaskTimerStrings[]).filter((v) => !!v);
  return taskTimerWithoutParsedDates.map((timer) => taskTimerStringsToTaskTimer(timer));
}

function saveTimersStringified(timersStringified: string) {
  localStorage.setItem('timers', timersStringified);
}

function saveTimers(taskTimers: TaskTimer[]) {
  localStorage.setItem('timers', JSON.stringify(taskTimers));
}

// initializing state
let timers: TaskTimer[] = [];
function initTimers() {
  const savedTimers = retrieveSavedTimers(); 
  if (savedTimers.length === 0) return;
  timers.push(...savedTimers)
};
initTimers();

createTimerNameInputElement.oninput = function() {
  if(createTimerNameInputElement.value.length <= 0) {
    createTimerSubmitButtonElement.disabled = true
  } else {
    createTimerSubmitButtonElement.disabled = false
  }
};

function updateTimerTable() {
  const backupButtonText = createTimerSubmitButtonElement.textContent!;
  createTimerSubmitButtonElement.innerText = '. . .';
  setTimeout(() => createTimerSubmitButtonElement.innerText = backupButtonText, 250)
  timerTableTBodyElement.querySelectorAll('*').forEach((e) => e.remove());
  if (timers.length <= 0) {
    addEmptyInfoRow()
  } else {
    timers.reverse().forEach(function(timer) {
      addTimerToTable(timer);
    })
  }
}
updateTimerTable();

document.querySelector<HTMLButtonElement>('#main-actions-export-button')!.onclick = () => {
  const data = localStorage.getItem('timers') ?? '';
  const file = genFile(data);
  const objectURL = URL.createObjectURL(file);
  const downloadLinkElement = createElement('a', {
    href: objectURL,
    download: file.name
  });
  const downloadLinkClickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
      removeEventListener('click', downloadLinkClickHandler);
    }, 150);
  };
  downloadLinkElement.onclick = downloadLinkClickHandler;
  downloadLinkElement.click();
};

const dataImportInputElement = document.querySelector<HTMLInputElement>('#main-actions-file-import')!;
dataImportInputElement.onchange = async function() {
  const file = (this as unknown as { files: File[] }).files[0];
  const content = await file.text();
  saveTimersStringified(content);
  timers = retrieveSavedTimers();
  updateTimerTable();
  dataImportInputElement.value = '';
};
document.querySelector<HTMLButtonElement>('#main-actions-import-button')!.onclick = () => dataImportInputElement.click()
