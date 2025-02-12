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



const createNewTimer = (name: string) => {
  const savedTimers = retrieveSavedTimers();
  savedTimers.push({ name, createdAt: new Date() });
  saveTimers(savedTimers);
  timers = savedTimers;
  updateTimerTable();
};

function addTimer(timer: TaskTimer) {
  const createdAtDate = new Date(timer.createdAt);
   const emptyRowElement = createElement('tr', {
    innerHTML: `<td>${timer.name}</td>`
  });
  const lastColumnElement = createElement('td', {
    innerHTML: `<td>${(Date.now() - createdAtDate.valueOf()) / 1000}s</td>`
  });
  emptyRowElement.append(lastColumnElement);
  setInterval(()=>{
    lastColumnElement.innerText = `${(Date.now() - createdAtDate.valueOf()) / 1000}s`
  }, 1000);
  timerTableTBodyElement.append(emptyRowElement); 
}

function addEmptyInfoRow() {
  const emptyRowElement = createElement('tr', {
    innerHTML: `
<td colspan="2">- 0 timers -</td>
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

type TaskTimer = {
  name: string,
  createdAt: Date
}

function retrieveSavedTimers(): TaskTimer[] {
  const savedTimers = localStorage.getItem('timers')
  return savedTimers ? JSON.parse(savedTimers) as TaskTimer[] : [];
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
      addTimer(timer);
    })
  }
}
updateTimerTable();


