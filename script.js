'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [20, 45.23, -30.5, 2500, -64.21, -13.9, 79.97, 130],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-05-15T17:01:17.194Z',
    '2020-06-07T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
    '2021-02-20T21:31:17.178Z',
    '2021-02-23T14:11:59.604Z',
    '2021-02-25T07:42:02.383Z',
    '2021-02-27T10:17:24.185Z',
  ],
  currency: 'INR',
  locale: 'hi-IN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [500, 340, -15, -79, -321, -100, 850, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const getConversionRate = function (cur) {
  switch (cur) {
    case "INR":
      return 72;
    case "USD":
      return 1;
    case "EUR":
      return 1.1;
    default:
      return 1;
  }
}

const formatedMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const dayPassed = calcDaysPassed(new Date(), date);

  if (dayPassed === 0) return `Today`;
  if (dayPassed === 1) return `Yesterday`;
  if (dayPassed <= 7) return `${dayPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();

    return new Intl.DateTimeFormat(locale).format(date);
  }
}

const formatCurr = function (val, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(val * getConversionRate(currency));
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ""; // emptying default data

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {  // pushing data in html
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatedMovementDate(date, acc.locale);
    const formattedMov = formatCurr(mov, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${(formattedMov)}</div>
      </div > `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(" ").map(word => word[0]).join("");
  });
};

createUsernames(accounts);

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => (acc + mov), 0);
  labelBalance.textContent = `${(formatCurr(acc.balance, acc.locale, acc.currency))}`;
}

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements.filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${formatCurr(incomes, acc.locale, acc.currency)}`

  const outgoing = acc.movements.filter(mov => mov < 0)
    .map(mov => Math.abs(mov))
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${formatCurr(outgoing, acc.locale, acc.currency)}`;

  const interest = acc.movements.filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${formatCurr(interest, acc.locale, acc.currency)}`
}
const updateUI = function (acc) {
  // DISPLAY MOVEMENTS
  displayMovements(acc);

  // DISPLAY BALANCE
  calcDisplayBalance(acc);

  // DISPLAY SUMMARY
  calcDisplaySummary(acc);
}

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // IN EACH CALL, PRINT REMAINING TIME TO UI
    labelTimer.textContent = `${min}:${sec}`;

    // WHEN 0 SEC, LOGOUT
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // DECREASE 1 SEC
    time--;
  };
  // SET TIME TO 5 MINUTES
  let time = 120;

  tick();
  // CALL THE TIMER EVERY SECOND
  const timer = setInterval(tick, 1000);
  return timer;
}
// Event Handkers

let currentAccount, timer;


// // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
  console.log(currentAccount);

  if (currentAccount?.pin === +(inputLoginPin.value)) {
    // CLEAR INPUT FIELDS
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // DISPLAY UI AND WELCOME MESSAGE
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(' ')[0]} `;
    containerApp.style.opacity = 100;
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // DISPLAY DATE
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);;
    // const min = `${now.getMinutes()}`.padStart(2, 0);;
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min} `;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    updateUI(currentAccount);
    console.log('LOGIN');
  }
})

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const recieverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  console.log(amount, recieverAcc);

  if (amount > 0 && recieverAcc && currentAccount.balance > amount && recieverAcc?.username !== currentAccount.username) {
    // DOING TRANSFER
    currentAccount.movements.push(-(amount / getConversionRate(currentAccount.currency)));
    recieverAcc.movements.push(amount / getConversionRate(recieverAcc.currency));

    // ADD TRANSFER DATE
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    // RESET TIMER
    clearInterval(timer);
    timer = startLogoutTimer();

    // CLEAR INPUT FIELDS
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferTo.blur();
    inputTransferAmount.blur();
  }
})

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add the movement
      currentAccount.movements.push(amount / getConversionRate(currentAccount.currency));

      // ADD LOAN DATE
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500)

    // RESET TIMER
    clearInterval(timer);
    timer = startLogoutTimer();

    // clear the UI
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
  }
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin) {
    // DELETE USER FROM DATA
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(index, 1);

    // LOGOUT (HIDE UI)
    containerApp.style.opacity = 0;

  }
  // CLEAR INPUT FIELDS
  inputCloseUsername.value = inputClosePin.value = '';
})

let sortedState = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sortedState);
  sortedState = !sortedState;
})

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
const deposits = movements.filter(function (mov) {
  return mov > 0;
})

const withdrawals = movements.filter(function (mov) {
  return mov < 0;
})
console.log(deposits);
console.log(withdrawals);

const balance = movements.reduce(function (acc, curr) {
  return acc + curr;
}, 0);
console.log(balance);

const eurToUsd = 1.1;

const totalDepositsUsd = movements.filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDepositsUsd)

// return <0, A, B (keep order)
// retun >0, B, A (switch order)
movements.sort((a, b) => {
  if (a > b) return 1;
  if (a < b) return -1;
})

// shortcut (ascending)
movements.sort((a, b) => a - b);
console.log(movements);

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000)