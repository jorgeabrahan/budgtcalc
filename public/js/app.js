'use strict';

import * as global from './modules/global.mjs';
import * as dbFuncs from './modules/db-funcs.mjs';
import * as ioFuncs from './modules/io-funcs.mjs';
import * as fbFuncs from './modules/fb-funcs.mjs';
import * as loginFuncs from './modules/login.mjs';
import * as theme from './modules/theme.mjs';

theme.selectInptTheme(theme.prevTheme); //Se selecciona el tema correspondiente en el input
theme.setTheme(theme.prevTheme); //Se establece el tema seleccionado al cargar

/* Se obtiene el formulario para agregar un inoutcome */
const dateHtml = document.querySelector('.date');
//Si se esta visualizando otro anio que no es el actual
if (global.otherYearView) dateHtml.textContent = `${global.yearToLoad}`; //Solo se muestra el anio
else { //Si se esta visualizando el anio actual
    dateHtml.textContent = `${global.actDate} ${global.actMnthName} ${global.yearToLoad}`; //Se muestra la fecha completa
    document.querySelector(`.${global.actMnthName}`).parentElement.setAttribute('open', ''); //Se abre el mes actual
}
/* ----------------------------------------------------- */

/* Al agregar un inoutcome */
global.frmAdd.addEventListener('submit', async (e) => {
    e.preventDefault();
    global.frmAddMsg.textContent = '';

    for (let inpt of global.frmAdd) {
        if (inpt.value !== '') continue;
        if (inpt.type === 'file') continue; //El input file no es obligatorio
        global.frmAddMsg.textContent = 'Debes llenar todos los campos.'; // Si hay inputs vacios
        return;
    }

    if (ioFuncs.maxFileSizeReached()) { //Si se sobrepasa el peso maximo de los archivos
        frmAddMsg.textContent = 'El peso de los archivos sobrepasa los 1.5MB, intente comprimiendolos o subiendo otros archivos.';
        return;
    }

    e.target.style.pointerEvents = 'none'; //Se quitan los eventos al formulario

    //Se obtiene la fecha del inoutcome del input del formulario
    const inptDate = global.frmAdd.inptDate.value.split('-');
    const inptDateYear = inptDate[0];
    const inptDateMonth = inptDate[1];
    const inptDateDay = inptDate[2];

    const io = {
        type: global.frmAdd.inptType.value,
        name: global.frmAdd.inptId.value.trim(),
        id: global.genNewId(),
        description: global.frmAdd.inptDesc.value.trim(),
        amount: Number(global.frmAdd.inptAmount.value),
        date: `${inptDateMonth}/${inptDateDay}/${inptDateYear}`,
        month: global.months[Number(inptDateMonth) - 1],
        year: inptDateYear,
        files: [],
    }
    
    //Si el io se repite
    if (global.frmAdd.inptRepeat.value != 'nunca') ioFuncs.repeatIoInMonths(ioFuncs.getMonthsToRepeat(global.frmAdd.inptRepeat.value, io), io);

    //Si el io tiene archivos
    if (global.frmAdd.inptFile.files.length > 0) {
        global.frmAddMsg.textContent = 'Espere mientras se suben los archivos a la base de datos.';
        await fbFuncs.saveIoFilesOnStorage(io.id, global.frmAdd.inptFile.files) //Se almacenan los archivos en el storage
        //Se obtiene los archivos del storage, se almacenan en el arr de files y se guardan los cambios en el arreglo y la interfaz
        fbFuncs.getSrcFilesFromStorage(io);
        global.frmAddMsg.textContent = '';
    } else { //Si el io no tiene archivos
        global.iosArr.push(io); //Se guarda el io en el arreglo
        dbFuncs.newIo(io); //Se crea el io en la interfaz
    }
    

    /* Limpiar campos del formulario */
    global.frmAdd.reset();
    for (let opt of global.frmAdd.inptType.options) {
        if (opt.value === io.type) opt.setAttribute('selected', '');
        else opt.removeAttribute('selected', '');
    }
    global.setFrmAddActDate();
    /* ----------------------------- */

    global.frmAdd.inptFile.parentElement.classList.remove('d-none');

    e.target.style.pointerEvents = 'all'; //Se vuelven a poner los eventos al formulario
});
/* ----------------------- */

/* Al editar un inoutcome */
const formeditMsg = document.getElementById('formeditMsg');
global.frmEdit.addEventListener('submit', e => {
    e.preventDefault();
    /* Si hay inputs vacios */
    formeditMsg.textContent = '';
    for (let inpt of global.frmEdit) {
        if (inpt.value !== '') continue;
        formeditMsg.textContent = 'Llena todos los campos';
        return;
    }
    /* -------------------- */

    const prevIoData = dbFuncs.getIoFromArr(global.frmEdit.getAttribute('key-edit'));

    const io = {
        ...prevIoData,
        type: global.frmEdit.inptNewType.value,
        name: global.frmEdit.inptNewId.value,
        id: global.frmEdit.getAttribute('key-edit'),
        description: global.frmEdit.inptNewDesc.value,
        amount: Number(global.frmEdit.inptNewAmount.value),
    }
    dbFuncs.editIo(io);
});


/* Al agregar un nuevo presupuesto */
global.btnNewBudg.addEventListener('click', () => {
    /* Mostrar modal para confirmar */
    const msgHeader = 'Nuevo presupuesto';
    const msgBody = `¿Estas seguro que deseas archivar el presupuesto de el año pasado y comenzar uno nuevo?`;
    const msgBtnText = 'Crear nuevo';
    global.shwModal(msgHeader, msgBody, dbFuncs.whenYearEnds, msgBtnText);
});
/* ------------------------------- */

/* Filtrar los meses del DOM */
const inptFltrByMnth = document.getElementById('inptFltrByMnth');
inptFltrByMnth.addEventListener('change', () => {
    switch (inptFltrByMnth.value) {
        case 'todos':
            ioFuncs.filterShowAll();
            break;
        case 'actual':
            ioFuncs.filterByMonthName(global.actMnthName.toLowerCase());
            break;
        default: //Si se filtra por un mes en especifico
            ioFuncs.filterByMonthName(inptFltrByMnth.value);
            break;
    }
});
/* -------------------------- */


/* Al realizar una busqueda en los ios */
const frmSearch = document.getElementById('frmSearch');
frmSearch.addEventListener('submit', e => {
    e.preventDefault();
    ioFuncs.searchOnIos(frmSearch.inptFltrSrch.value.toLowerCase());
    document.getElementById(global.actMnthName.toLowerCase()).setAttribute('open', '');
});
/* ----------------------------------- */

/* Al hacer un sumit del formulario para iniciar sesion */
global.frmLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    global.frmLogin.style.pointerEvents = 'none'; //Se quitan todos los eventos para que no se llame la funcion de iniciar sesion varias veces

    global.frmLoginMsg.innerText = ''; //Se limpia el mensaje del formulario

    global.frmLoginMsg.innerText = loginFuncs.validateLoginFrm(global.frmLogin.inptMail, global.frmLogin.inptPaswrd);
    if (global.frmLoginMsg.innerText !== '') return; //Si hay algun error al validar los campos correo y contraseña

    loginFuncs.logUser(global.frmLogin.inptMail, global.frmLogin.inptPaswrd);
});
/* ---------------------------------------------------- */

/* Al hacer click en cerrar sesion debe terminar la sesion en firebase y borrar la informacion del LS */
global.btnLogout.addEventListener('click', () => {
    loginFuncs.onLogout();
});
/* -------------------------------------------------------------------------------------------------- */