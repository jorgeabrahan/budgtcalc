'use strict';

const currFrmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'HNL' });

const cntMonths = document.getElementById('cntMonths');
const anualBudg = document.getElementById('anualBudg');

const anualIncms = document.getElementById('anualIncms');
const anualOutcms = document.getElementById('anualOutcms');
const outcmsPrcntg = document.getElementById('outcmsPrcntg');

const rfrmtCurr = /[a-zA-Z\,\s]/g;
let yearBudg = 0, yearIncms = 0, yearOutcms = 0, prcntg = 0;


const modalInfo = document.getElementById('modalInfo');
const modalCnt = document.getElementById('modalCnt');
function shwModal(title, description, func, btnTxt) {
    modalInfo.innerHTML = '';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal__title';
    modalTitle.innerHTML = title;
    modalInfo.appendChild(modalTitle);
    const modalDesc = document.createElement('p');
    modalDesc.className = 'modal__description';
    modalDesc.innerHTML = description;
    modalInfo.appendChild(modalDesc);
    if (arguments.length === 4) {
        const modalBtn = document.createElement('button');
        modalBtn.className = 'form__button form__button--modal';
        modalBtn.textContent = btnTxt;
        modalBtn.onclick = func;
        modalInfo.appendChild(modalBtn);
    }
    modalCnt.classList.remove('d-none');
}

const checkIfNewYear = year => {
    if (year.value !== actYear) {
        shwModal('¡El año ha terminado!', `
        Presupuesto de este año: <strong>${currFrmt.format(yearBudg)}</strong>
        <br>
        Ingresos de este año: <strong>${currFrmt.format(yearIncms)}</strong> 
        <br>
        Egresos de este año: <strong>${currFrmt.format(yearOutcms)}</strong> 
        <br>
        Tus egresos representaron el <strong>${prcntg}%</strong> del total de tus ingresos.
        <br> <br>
        Cuando estes listo para comenzar con tu presupuesto de este año da clic en el boton 'nuevo presupuesto' en la parte superior de la página.
        `);
    }
}

const cookies = [];
for (let cookie of document.cookie.split(';')) {
    const cookieSpltd = cookie.trim().split('=');
    cookies.push({ name: cookieSpltd[0], value: cookieSpltd[1] });
}

const calcYearBalance = () => {
    yearBudg = 0, yearIncms = 0, yearOutcms = 0, prcntg = 0;
    for (let month of cntMonths.children) {
        yearBudg += Number(month.lastElementChild.children[0].lastElementChild.textContent.replace(rfrmtCurr, '')) ?? 0;
        yearIncms += Number(month.lastElementChild.children[1].lastElementChild.textContent.replace(rfrmtCurr, '')) ?? 0;
        yearOutcms += Number(month.lastElementChild.children[2].lastElementChild.textContent.replace(rfrmtCurr, '')) ?? 0;
    }

    anualBudg.textContent = currFrmt.format(yearBudg);
    anualIncms.textContent = currFrmt.format(yearIncms);
    anualOutcms.textContent = currFrmt.format(yearOutcms);
    prcntg = Math.round((yearOutcms / yearIncms) * 100);
    if (isNaN(prcntg)) prcntg = 0;
    if (prcntg === Infinity) prcntg = 100;
    outcmsPrcntg.textContent = `${prcntg}%`;
}

const calcMonthBalance = month => {
    let totIncome = 0, totOutcome = 0;
    for (let inoutcome of month.children) {
        const inoutHeader = inoutcome.firstElementChild; 
        // Se obtiene la cantidad - se le quita el formato de moneda - se quitan los espacios - se convierte en numero
        const inoutAmount = Number(inoutHeader.firstElementChild.textContent.replace(rfrmtCurr, ''));

        if (inoutHeader.classList.contains('egreso')) totOutcome += inoutAmount;
        else totIncome += inoutAmount;
    }
    month.nextElementSibling.children[0].lastElementChild.innerText = currFrmt.format(totIncome - totOutcome); // Presupuesto mensual
    month.nextElementSibling.children[1].lastElementChild.innerText = currFrmt.format(totIncome); // Ingreso mensual
    month.nextElementSibling.children[2].lastElementChild.innerText = currFrmt.format(totOutcome); // Egreso mensual
    
    calcYearBalance();
}

let inoutDbRes;
const dbReq = indexedDB.open('inoutDb', 1);
dbReq.addEventListener('upgradeneeded', () => {
    inoutDbRes = dbReq.result;
    inoutDbRes.createObjectStore('inoutObjStr', {autoIncrement: true});
})

const createInoutcomeHtml = (inoutcome, id) => {
    const inoutcomeCnt = document.createElement('div');
    inoutcomeCnt.className = 'inoutcome';
    inoutcomeCnt.id = id;
    inoutcomeCnt.innerHTML = `
    <header class="inoutcome__header inoutcome__header--${inoutcome.type} ${inoutcome.type}">
        <p class="emphasis">
            ${currFrmt.format(inoutcome.amount)}
        </p>
        <div class="income__buttons">
            <button class="fa fa-pen" onclick="shwEditFrm(this.parentElement.parentElement.parentElement.id)"></button>
            <button class="fa fa-trash" onclick="delInoutcomeObj(this.parentElement.parentElement.parentElement)"></button>
        </div>
    </header>
    <details class="inoutcome__more">
        <summary class="inoutcome__id">
            <p>
                ${inoutcome.id}
            </p>
            <i class="fa fa-info-circle"></i>
        </summary>
        <div class="inoutcome__details">
            <p class="inoutcome__description">
                ${inoutcome.description}
            </p>
            <p class="inoutcome__date">
                ${inoutcome.date}
            </p>
        </div>
    </details>
    `;
    return inoutcomeCnt;
}

const changeObjStrRules = newRule => inoutDbRes.transaction('inoutObjStr', newRule).objectStore('inoutObjStr');

const formedit = document.getElementById('formedit');

const editInoutcomeObj = (newObj, id, formedit) => {
    changeObjStrRules('readwrite').put(newObj, id).addEventListener('success', () => {
        document.getElementById(`${id}`).remove();
        document.querySelector(`.${newObj.month}`).appendChild(createInoutcomeHtml(newObj, id));
        calcMonthBalance(document.querySelector(`.${newObj.month}`));
        formedit.parentElement.classList.add('d-none');
    })
}

const shwEditFrm = objId => {
    const inoutObjEdit = changeObjStrRules('readonly').get(Number(objId));
    inoutObjEdit.addEventListener('success', () => {
        formedit.parentElement.classList.remove('d-none');
        formedit.setAttribute('key-edit', objId);
        formedit.setAttribute('obj-date', inoutObjEdit.result.date);

        // Se selecciona la opcion segun el tipo
        for (let option of formedit.inptNewType) {
            option.removeAttribute('selected', '');
            if (option.value === inoutObjEdit.result.type) option.setAttribute('selected', '');
        }

        // Se rellena el formulario con los valores actuales
        formedit.inptNewType.value = inoutObjEdit.result.type;
        formedit.inptNewId.value = inoutObjEdit.result.id;
        formedit.inptNewDesc.value = inoutObjEdit.result.description;
        formedit.inptNewAmount.value = inoutObjEdit.result.amount;
    })
}

const delInoutcomeObj = obj => {
    changeObjStrRules('readwrite').delete(Number(obj.id)).addEventListener('success', () => {
        const month = obj.parentElement;
        obj.remove();
        calcMonthBalance(month);
    });
}

const newInoutcomeObj = (inoutObj) => {
    const inoutObjAdded = changeObjStrRules('readwrite').add(inoutObj);
    inoutObjAdded.addEventListener('success', () => {
        document.querySelector(`.${inoutObj.month}`).appendChild(createInoutcomeHtml(inoutObj, inoutObjAdded.result));
        calcMonthBalance(document.querySelector(`.${inoutObj.month}`));
    })
}

const shwInoutObjStr = () => {
    const readReq = changeObjStrRules('readonly').openCursor();
    readReq.addEventListener('success', () => {
        const readRes = readReq.result;
        if (!readRes) return;
        const month = document.querySelector(`.${readRes.value.month}`);
        month.appendChild(createInoutcomeHtml(readRes.value, readRes.key));
        calcMonthBalance(month);
        readRes.continue();
    });
}

const lookForYearCookie = () => {
    if (!cookies.find(cookie => cookie.name === 'year')) {
        document.cookie = `year=${actYear};secure`;
    } else {
        const year = cookies.find(cookie => cookie.name === 'year');
        checkIfNewYear(year);
    }
}

const loadInoutObjStr = (inoutsFrmDb) => {
    for (let inout of inoutsFrmDb) {
        const month = document.querySelector(`.${inout.month}`);
        month.appendChild(createInoutcomeHtml(inout, inout.key));
        calcMonthBalance(month);
    }
    lookForYearCookie();
}

const readInoutObjStr = func => {
    const inoutsFrmDb = [];
    const readReq = changeObjStrRules('readonly').openCursor();
    readReq.addEventListener('success', () => {
        const readRes = readReq.result;
        if (!readRes) { func(inoutsFrmDb); return };
        inoutsFrmDb.push({ ...readRes.value, key: readRes.key });
        readRes.continue();
    });
}


dbReq.addEventListener('success', () => {
    inoutDbRes = dbReq.result;
    readInoutObjStr(loadInoutObjStr);
});