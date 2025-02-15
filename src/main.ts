import './style.css'
import { createElement } from './utils';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1 class="title">Named Timers</h1>
  <h4 class="subtitle">a self-organization task time tracking tool</h4>
  <form id="create-timer-form" class="create-timer-form">
    <label for="name">name</label>
    <input type="text" id="create-timer-name-input" name="name" placeholder="some boring task..." />
    <button type="submit" id="create-timer-submit-button" disabled>Create timer</button>
  </form>
  <table id="timer-table">
    <thead>
      <tr>
        <td>Name</td>
        <td>Timer</td>
        <td></td>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
`;
const timerTableElement = document.querySelector<HTMLTableElement>('#timer-table')!;
const timerTableTBodyElement = timerTableElement.tBodies[0]!;
const createTimerFormElement = document.querySelector<HTMLFormElement>('#create-timer-form')!;
const createTimerNameInputElement = document.querySelector<HTMLInputElement>('#create-timer-name-input')!;
const createTimerSubmitButtonElement = document.querySelector<HTMLButtonElement>('#create-timer-submit-button')!;

const genUUID = function() {
  return crypto.randomUUID();
}

const timeSince = (timeInSeconds: number) => {
  // at some point I want to make this return a nicely formatted string of text, but not rn
  return timeInSeconds;
};

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
  const secondsPassed = () => Math.floor(((Date.now() - timer.createdAt.valueOf()) / 1000)) ;
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
      timerColumnElement.innerHTML = `started: ${timer.createdAt.toUTCString()}<br>${timer.pausedAt?.toUTCString() ? 'stopped: '+timer.pausedAt.toUTCString() : 'seconds passed: '+timeSince(secondsPassed())+'s'}`
    }, 1000);
  }
  const actionColumn = createElement('td', {});
  const pauseButton = createElement('button', {
    innerHTML: timer.pausedAt === null ? 'STOP' : 'paused',
    disabled: timer.pausedAt !== null
  });
  pauseButton.onclick = () => pauseTimer(timer);
  const removeButton = createElement('button', {
    innerText: 'remove'
  });
  removeButton.onclick = () => {
    removeTimer(timer);
  };
  actionColumn.append(pauseButton);
  actionColumn.append(removeButton);
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
  const emptyRowElement = createElement('tr', {
    innerHTML: `
<td colspan="3">- 0 timers -</td>
    `
  })
  timerTableTBodyElement.append(emptyRowElement);
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
  const fullyParsedTimers = taskTimerWithoutParsedDates.map((timer) => taskTimerStringsToTaskTimer(timer));
  return (fullyParsedTimers);
}

function saveTimers(timers: TaskTimer[]) {
  localStorage.setItem('timers', JSON.stringify(timers));
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
  createTimerSubmitButtonElement.innerText = 'loading...';
  setTimeout(() => createTimerSubmitButtonElement.innerText = backupButtonText, 250)
  timerTableTBodyElement.querySelectorAll('*').forEach((e) => e.remove());
  console.log(timerTableTBodyElement);
  if (timers.length <= 0) {
    addEmptyInfoRow()
  } else {
    timers.forEach(function(timer) {
      addTimerToTable(timer);
    })
  }
}
updateTimerTable();


