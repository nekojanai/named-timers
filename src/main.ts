import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1 class="title">Named Timers</h1>
  <h4 class="subtitle">a self-organization task time tracking tool</h4>
  <form id="create-timer-form" class="create-timer-form">
    <label for="name">name</label>
    <input type="text" id="name" name="name" placeholder="some boring task..." />
    <button type="submit" id="create-timer-submit-button">Create timer</button>
  </form>
  <table id="timer-table">
    <thead>
      <tr>
        <td>Name</td>
        <td>Timer</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2"> 
          No Timers
        </td>
      </tr>
    </tbody>
  </table>
`;

const createNewTimer = (name: string) => {
  const savedTimers = retrieveSavedTimers();
  savedTimers.push({ name, createdAt: new Date() });
  updateTimerTable();
};

const createTimerFormElement = document.querySelector<HTMLFormElement>('#create-timer-form')!;
const createTimerSubmitButtonElement = document.querySelector<HTMLButtonElement>('#create-timer-submit-button')!;
createTimerSubmitButtonElement.onclick = (event) => {
  event.preventDefault();
  const formData = new FormData(createTimerFormElement, createTimerSubmitButtonElement);
  const formDataAsObject = Object.fromEntries(formData.entries()) as { name: string };
  createNewTimer(formDataAsObject.name);
};

type TaskTimer = {
  name: string,
  createdAt: Date
}

function retrieveSavedTimers(): TaskTimer[] {
  const savedTimers = localStorage.getItem('timers')
  return savedTimers ? JSON.parse(savedTimers) as TaskTimer[] : [];
}

// initializing state
const timers: TaskTimer[] = [];
function initTimers() {
  const savedTimers = retrieveSavedTimers(); 
  if (savedTimers.length === 0) return;
  timers.push(...savedTimers)
};
initTimers();

function updateTimerTable() {
  const timerTableElement = document.querySelector<HTMLTableElement>('#timer-table')!;
  const timerTableTBodyElement = timerTableElement.tBodies[0]!;
  timerTableTBodyElement.querySelectorAll('*').forEach((e) => e.remove());
  console.log(timerTableTBodyElement);
}


