import * as fbImports from './modules/fb-imports.mjs';
import * as modal from './modules/modal.mjs';
import * as theme from './modules/theme.mjs';

const exeHtmlFunc = (func) => func();
const modalBtn = (func, btnTxt) => `<button class="form__button form__button--modal" onclick="exeHtmlFunc(${func})">${btnTxt}</button>`;

//Instancia para dar formato de moneda
const currFrmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'HNL' });

theme.selectInptTheme(theme.prevTheme); //Se selecciona el tema correspondiente en el input
theme.setTheme(theme.prevTheme); //Se establece el tema seleccionado al cargar

const userLoged = JSON.parse(localStorage.getItem('userInfo')); //Uid y correo del usuario se obtienen del almacenamiento local
const userLogedHtml = document.getElementById('userLogedHtml'); //Se obtiene el elemento en el que se mostrara el correo del usuario
userLogedHtml.textContent = userLoged.email; //Se muestra el correo del usuario en la cabecera de la pagina

const yearsData = []; //Arreglo para almacenar los objetos con la informacion de los anios

/* Funcion para agregar un presupuesto en el anio anterior al primero del que se tiene un presupuesto */
const btnAddNewYear = document.getElementById('btnAddNewYear');
btnAddNewYear.addEventListener('click', () => {
    const firstYear = Number(yearsData[0].year); //Se obtiene el primer anio del que se tiene presupuesto
    const yearToAdd = firstYear - 1; //Se obtiene el anio a añadir, es decir, un anio menos que el primero (Ej.: 2022 - 1 = 2021)
    localStorage.setItem('inoutcomes', JSON.stringify([])); //Se vacia el arreglo con los ios
    localStorage.setItem('View', yearToAdd); //Se establece el anio a visualizar como el anio agregado
    open('index.html', '_self'); //Se abre la pagina del index
});
/* -------------------------------------------------------------------------------------------------- */


const actYear = new Date().getFullYear().toString(); //Se obtiene el anio actual

/* Funcion para mostrar el anio seleccionado */
const showYearIos = (year) => {
    localStorage.setItem('inoutcomes', JSON.stringify([])); //Se establece el arreglo con los ios en un arreglo vacio
    localStorage.setItem('View', year); //Se establece en el almacenamiento local el anio a visualizar
    open('index.html', '_self'); //Se abre la pagina del index
}
/* ----------------------------------------- */

const yearsHtmlCnt = document.getElementById('yearsHtmlCnt'); //Contenedor de los anios en el html
/* Funcion para crear el html del anio */
const createYearHtml = (year, yearIncm, yearOutcm, yearBudgt) => {
    const yearHtml = document.createElement('DIV');
    yearHtml.className = 'year';
    yearHtml.innerHTML = `
        <h2 class="year__name">${year} ${actYear == year ? '(actual)' : ''}</h2>
        <div class="year__details">
            <p><span>Ingresos:</span> <span>${currFrmt.format(yearIncm)}</span></p>
            <p><span>Egresos:</span> <span>${currFrmt.format(yearOutcm)}</span></p>
            <p><span>Presupuesto:</span> <span>${currFrmt.format(yearBudgt)}</span></p>
        </div>
    `;
    yearHtml.addEventListener('click', () => showYearIos(year))
    return yearHtml;
}
/* ----------------------------------- */

/* Funcion para calcular los ingresos, egresos y balance del anio */
const calcYearBalance = (year, yearData) => {
    let totIncm = 0, totOutcm = 0;
    for (let io of yearData) {
        if (io.type === 'ingreso') totIncm += io.amount; //Se obtiene el total de los ingresos del anio
        else totOutcm += io.amount; //Se obtiene el total de los egresos del anio
    }
    yearsData.push({
        year,
        yearIncm: totIncm,
        yearOutcm: totOutcm,
        yearBudgt: totIncm - totOutcm
    });
    yearsHtmlCnt.appendChild(createYearHtml(year, totIncm, totOutcm, totIncm - totOutcm));
}
/* -------------------------------------------------------------- */

/* Funcion para mostrar el balance financiero de todos los anios */
const showAllYearsBalance = () => {
    let totYearsIncm = 0, totYearsOutcm = 0, totYearsBudgt = 0;
    for (let year of yearsData) {
        totYearsIncm += year.yearIncm; //Se obtiene el total de ingresos por todos los anios
        totYearsOutcm += year.yearOutcm; //Se obtiene el total de egresos por todos los anios
        totYearsBudgt += year.yearBudgt; //Se obtien el total del presupuesto por todos los anios
    }

    /* Se inserta en el html el balance financiero de todos los anios */
    document.getElementById('yearsIncmHtml').textContent = currFrmt.format(totYearsIncm);
    document.getElementById('yearsOutcmHtml').textContent = currFrmt.format(totYearsOutcm);
    document.getElementById('yearsBudgtHtml').textContent = currFrmt.format(totYearsBudgt);
}
/* ------------------------------------------------------------- */

/* Funcion para obtener todos los documentos de la coleccion del usuario */
const getFbDocs = async () => {
    const docs = await fbImports.getDocs(fbImports.collection(fbImports.fbDB, userLoged.uid)).catch(() => {
        modal.shwModal('Error al leer la base de datos', 'Ocurrio un error al leer los documentos de la base de datos.');
    });
    docs.forEach(doc => {
        const year = doc.id;
        calcYearBalance(year, doc.data().data);
    });

    showAllYearsBalance();
    btnAddNewYear.classList.remove('d-none'); //Se muestra el boton para gregar presupuesto en un anio anterior
}
/* ---------------------------------------------------------------------- */

window.onload = () => { //Cuando cargue el documento
    getFbDocs(); //Se llama la funcion para cargar los anios de firebase
}