import * as dbFuncs from "./db-funcs.mjs";
import * as ioFuncs from "./io-funcs.mjs";
import * as modal from './modal.mjs';

/* Codigo relacionado con importaciones de firebase */
let fbDataActYear; //Se define un arreglo para almacenar la informacion que se reciba de la base de datos del año actual
const setFbDataActYear = data => fbDataActYear = data;

let userLoged = JSON.parse(localStorage.getItem('userInfo'));
const setUserLoged = user => userLoged = user;
const userLogedHtml = document.getElementById('userLogedHtml');
/* ------------------------------------------------ */

//Se declaran variables globales
const currFrmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'HNL' });
const rfrmtCurr = /[a-zA-Z\,\s]/g;

const loadIoArrFromLS = () => JSON.parse(localStorage.getItem('inoutcomes')) || [];
let iosArr = loadIoArrFromLS();
const setIosArr = newArr => iosArr = newArr;

/* Obtener la fecha actual */
const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre',
    'Octubre', 'Noviembre', 'Diciembre'
];

const frmtDate = valToFrmt => valToFrmt < 10 ? `0${valToFrmt}` : valToFrmt.toString();
const date = new Date();
let yearToLoad = date.getFullYear().toString();
const setYearToLoad = newYear => yearToLoad = newYear; //Funcion para cambiar el anio a cargar
const actMnthName = months[date.getMonth()];
const actMnth = frmtDate(date.getMonth() + 1);
const actDate = frmtDate(date.getDate());
/* ----------------------- */

/* Se obtienen todas las cookies al cargar la pagina y se almacenan en un arreglo */
const cookies = [];
for (let cookie of document.cookie.split(';')) {
    const cookieSpltd = cookie.trim().split('=');
    cookies.push({ name: cookieSpltd[0], value: cookieSpltd[1] });
}
/* ------------------------------------------------------------------------------ */


/* Funcion para crear un id */
const genNewId = () => {
    let ID = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for ( var i = 0; i < 62; i++ ) ID += characters.charAt(Math.floor(Math.random() * 62));
    return ID;
}
/* ------------------------- */

const frmEdit = document.getElementById('frmEdit'); //Formulario para editar un io

const cntMonths = document.getElementById('cntMonths'); //Contenedor de los meses en el DOM

/* Elementos para mostrar la previsualizacion de los archivos ingresados */
const docsPopup = document.getElementById('docsPopup');
const docsBtns = document.getElementById('docsBtns');
const docsViewer = document.getElementById('docsViewer');
const docsGoBack = document.getElementById('docsGoBack');
docsGoBack.addEventListener('click', () => {
    dbFuncs.loadDocsViewer();
})
/* ---------------------------------------------------------------------- */


const frmAdd = document.getElementById('frmAdd');
const frmAddMsg = document.getElementById('frmAddMsg');
/* Establecer la fecha actual en el input del formulario */
const setFrmAddActDate = () => {
    frmAdd.inptDate.min = `${yearToLoad}-01-01`;
    frmAdd.inptDate.max = `${yearToLoad}-12-31`;
    frmAdd.inptDate.value = `${yearToLoad}-${actMnth}-${actDate}`;
}
/* ----------------------------------------------------- */

const inptFltrByMnth = document.getElementById('inptFltrByMnth'); //Se obtiene el input para filtrar por mes

/* Codigo para cuando se este visualizando un anio que no sea el actual */
const selectedYear = localStorage.getItem('View') || yearToLoad; //Se intenta obtener el anio a visualizar y si no existe se establece el actual
let otherYearView = false;
//Si el anio a visualizar es diferente al anio actual
if (selectedYear !== yearToLoad) {
    const modalMsg = `
        Estas en el modo de visualizacion de el año <strong>${selectedYear}</strong>.<br /><br />
        Para volver al año actual:<br />
        1- Da clic en el botón "Todos los años".<br />
        2- Busca el año actual "<strong>${yearToLoad}</strong>" y da clic en el.
    `;
    //Se accede a las opciones del filtrador del mes
    for (let option of inptFltrByMnth.options) if (option.value === 'actual') option.classList.add('d-none'); //Se oculta el filtrador del mes actual
    modal.shwModal('Modo de visualizacion', modalMsg);
    setYearToLoad(selectedYear); //Se establece el anio actual como el anio a visualizar
    otherYearView = true; //Se esstablece como verdadero a que se esta visualizando otro anio que no es el actual
}
/* -------------------------------------------------------------------- */

/* Al subir archivos en el input file */
frmAdd.inptFile.addEventListener('change', () => {
    if (ioFuncs.maxFileSizeReached()) frmAddMsg.innerText = 'El peso de los archivos sobrepasa los 2MB, intente comprimiendolos o subiendo otros archivos.';
    else frmAddMsg.innerText = '';
})
/* ---------------------------------- */

/* Al cambiar el input repetir */
frmAdd.inptRepeat.addEventListener('change', () => {
    frmAddMsg.textContent = '';
    frmAdd.inptFile.parentElement.classList.remove('d-none');
    if (frmAdd.inptRepeat.value != 'nunca') {
        frmAddMsg.textContent = 'Aviso: No se permiten agregar archivos en montos que se repiten, asi se evita que se suba el mismo archivo varias veces a la base de datos.';
        frmAdd.inptFile.parentElement.classList.add('d-none');
        frmAdd.inptFile.value = '';
    }
})
/* --------------------------- */

const btnNewBudg = document.getElementById('btnNewBudg'); // Boton para crear un nuevo presupuesto y si tiene la sesion iniciada archivarlo en todos los años

const frmLogin = document.getElementById('frmLogin');
const frmLoginMsg = document.getElementById('frmLoginMsg');

const btnShowPopupLogin = document.getElementById('btnShowPopupLogin');
const loginPopup = document.getElementById('loginPopup');
btnShowPopupLogin.addEventListener('click', () => {
    loginPopup.classList.remove('d-none');
    frmLogin.inptMail.focus();
});

const btnLogout = document.getElementById('btnLogout');

const btnShowPrevBudgts = document.getElementById('btnShowPrevBudgts');

export { currFrmt, rfrmtCurr, iosArr, yearToLoad, setYearToLoad, actMnth, actMnthName, actDate, otherYearView, cookies, genNewId, frmEdit, months, frmtDate, cntMonths, docsPopup, docsGoBack, docsBtns, docsViewer, frmAdd, frmAddMsg, setFrmAddActDate, inptFltrByMnth, btnNewBudg, btnShowPopupLogin, loginPopup, btnLogout, btnShowPrevBudgts, frmLogin, frmLoginMsg, fbDataActYear, setFbDataActYear, userLoged, userLogedHtml, setIosArr, setUserLoged};