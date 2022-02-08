'use strict';

const frmtDate = valToFrmt => valToFrmt < 10 ? `0${valToFrmt}` : valToFrmt.toString();
const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre',
    'Octubre', 'Noviembre', 'Diciembre'
];

class Inoutcome {
    constructor(type, id, description, amount, date) {
        this.type = type;
        this.id = id;
        this.description = description;
        this.amount = Number(amount);
        this.date = date;
        this.month = months[Number(date.split('/')[1]) - 1];
        this.year = date.split('/')[0];
    }
}

const inptTheme = document.getElementById('inptTheme');
inptTheme.onchange = () => { document.body.classList.toggle('dark') };

const date = new Date();
const actYear = date.getFullYear().toString();
const actMnth = frmtDate(date.getMonth() + 1);
const actMnthName = months[date.getMonth()];
const actDate = frmtDate(date.getDate()); // Dia del mes actual

const formadd = document.getElementById('formadd');
const formaddMsg = document.getElementById('formaddMsg');
formadd.inptDate.min = `${actYear}-01-01`;
formadd.inptDate.max = `${actYear}-12-31`;
formadd.inptDate.value = `${actYear}-${actMnth}-${actDate}`;

document.querySelector('.date').textContent = `${actDate} ${actMnthName} ${actYear}`;
document.querySelector(`.${actMnthName}`).parentElement.setAttribute('open', '');

formadd.addEventListener('submit', e => {
    e.preventDefault();
    formaddMsg.textContent = '';
    for (let inpt of formadd) {
        if (inpt.value !== '') continue;
        formaddMsg.textContent = 'Llena todos los campos'; // Si hay inputs vacios
        return;
    }

    const inoutcome = new Inoutcome(formadd.inptType.value, formadd.inptId.value, formadd.inptDesc.value, formadd.inptAmount.value, formadd.inptDate.value.replace(/\-/g, '/'));
    newInoutcomeObj(inoutcome);
    formadd.inptId.value = '';
    formadd.inptDesc.value = '';
    formadd.inptAmount.value = '';
});
const formeditMsg = document.getElementById('formeditMsg');
formedit.addEventListener('submit', e => {
    e.preventDefault();
    formeditMsg.textContent = '';
    for (let inpt of formedit) {
        if (inpt.value !== '') continue;
        formeditMsg.textContent = 'Llena todos los campos'; // Si hay inputs vacios
        return;
    }

    const newInoutcome = new Inoutcome(formedit.inptNewType.value, formedit.inptNewId.value, formedit.inptNewDesc.value, formedit.inptNewAmount.value, formedit.getAttribute('obj-date'));

    editInoutcomeObj(newInoutcome, Number(formedit.getAttribute('key-edit')), formedit);
});
