"use strict";
import * as global from "./global.mjs";
import * as dbFuncs from "./db-funcs.mjs";
import * as fbFuncs from "./fb-funcs.mjs";
import { prevTheme } from "./theme.mjs";

/* Calcular el balance financiero del año (ingresos, egresos y presupuesto) */
const anualBudgt = document.getElementById("anualBudg");
const anualIncms = document.getElementById("anualIncms");
const anualOutcms = document.getElementById("anualOutcms");
const outcmsPrcntg = document.getElementById("outcmsPrcntg");
const calcYearBalance = () => {
    let yearIncms = 0,
        yearOutcms = 0,
        prcntg = 0;

    for (let io of global.iosArr) {
        //Se obtienen los ingresos y egresos anuales
        if (io.type === "ingreso") {
            yearIncms += io.amount;
            continue;
        }
        yearOutcms += io.amount;
    }

    /* Se muestran en la interfaz */
    anualBudgt.textContent = global.currFrmt.format(yearIncms - yearOutcms);
    anualIncms.textContent = global.currFrmt.format(yearIncms);
    anualOutcms.textContent = global.currFrmt.format(yearOutcms);
    /* -------------------------- */

    /* Se trabaja con el porcentaje */
    prcntg = Math.round((yearOutcms / yearIncms) * 100); //Se obtiene el porcentaje redondeado
    if (isNaN(prcntg)) prcntg = 0; //Si no es un numero
    if (prcntg === Infinity) prcntg = 100; //Si es mas de 100
    outcmsPrcntg.textContent = `${prcntg}%`; //Se muestra en la interfaz
    /* --------------------------- */
};
/* ------------------------------------------------------------------------ */

/* Calcular el balance del mes */
const calcMonthBalance = (month) => {
    let totIncm = 0,
        totOutcm = 0;
    for (let io of global.iosArr) {
        //Por cada inoutcome
        if (io.month == month) {
            //Si el mes es igual al que se desea calcular
            if (io.type === "ingreso") totIncm += io.amount;
            else totOutcm += io.amount;
        }
    }

    const monthBudgt = document.querySelector(`#${month.toLowerCase()} .month__amount--budget`);
    const monthIncm = document.querySelector(`#${month.toLowerCase()} .month__amount--income`);
    const monthOutcm = document.querySelector(`#${month.toLowerCase()} .month__amount--outcome`);

    monthBudgt.innerText = global.currFrmt.format(totIncm - totOutcm); // Presupuesto mensual
    monthIncm.innerText = global.currFrmt.format(totIncm); // Ingreso mensual
    monthOutcm.innerText = global.currFrmt.format(totOutcm); // Egreso mensual
    calcYearBalance();
};
/* --------------------------- */

const getParsedIoFiles = (id) => JSON.parse(localStorage.getItem(`${id}`)) || [];

/* Crea el Html de un inoutcome */
const createIoHtml = (ioObj) => {
    const inoutcomeCnt = document.createElement("div");
    inoutcomeCnt.className = "inoutcome";
    inoutcomeCnt.id = ioObj.id;
    inoutcomeCnt.innerHTML = `
    <header class="inoutcome__header inoutcome__header--${ioObj.type} ${ioObj.type}">
        <p class="emphasis inoutcome__amount">
            ${global.currFrmt.format(ioObj.amount)}
        </p>
        <div class="income__buttons">
            ${ioObj.files.length > 0 ? '<button class="file-btn"><span class="material-icons">description</span></button>' : ""}
            <button class="edit-btn"><span class="material-icons">edit</span></button>
            <button class="delete-btn"><span class="material-icons">delete</span></button>
        </div>
    </header>
    <details class="inoutcome__more">
        <summary class="inoutcome__id">
            <p class="inoutcome__name">
                ${ioObj.name}
            </p>
            <span class="material-icons">info</span>
        </summary>
        <div class="inoutcome__details">
            <p class="inoutcome__description">
                ${ioObj.description}
            </p>
            <p class="inoutcome__date">
                ${ioObj.date}
            </p>
        </div>
    </details>
    `;

    ioObj.files.length &&
        inoutcomeCnt.querySelector(".file-btn").addEventListener("click", () => dbFuncs.showDocsPrev(dbFuncs.getIoFromArr(ioObj.id))); //Si tiene archivos
    inoutcomeCnt.querySelector(".edit-btn").addEventListener("click", () => dbFuncs.shwEditFrm(dbFuncs.getIoFromArr(ioObj.id))); //Evento para eliminar inoutcome
    inoutcomeCnt.querySelector(".delete-btn").addEventListener("click", () => dbFuncs.deleteIo(ioObj.id, false)); //Evento para eliminar inoutcome de la interfaz y del arreglo
    return inoutcomeCnt;
};
/* ---------------------------- */

/* Funciones para filtrar los meses */
const filterByMonthName = (monthName) => {
    for (let mnth of global.cntMonths.children) {
        //Por cada mes del DOM
        if (monthName !== mnth.id) {
            //Si no es el mes por el que se filtro
            mnth.classList.add("d-none");
            mnth.removeAttribute("open", "");
            continue;
        }
        //Si es el mes por el que se filtro
        mnth.classList.remove("d-none");
        mnth.setAttribute("open", "");
    }
};
const filterShowAll = () => {
    for (let mnth of global.cntMonths.children) {
        mnth.classList.remove("d-none");
        mnth.removeAttribute("open", "");
    }
};
/* -------------------------------- */

/* Filtra los ios segun una palabra clave */
const searchOnIos = (keyWord) => {
    //Se establecen los colores de los bordes segun el caso
    const ifMatchBrdr = "#FCA311";
    const ifNotMatchBrdr = prevTheme === "dark" ? "transparent" : "#14213D";

    for (let io of global.iosArr) {
        const { name, description } = io; //Se obtiene el nombre y la descripcion para buscar un match
        const ioHtmlCnt = document.getElementById(io.month.toLowerCase());
        const ioHtmlElement = document.getElementById(io.id);
        if (keyWord !== "" && (name.toLowerCase().includes(keyWord) || description.toLowerCase().includes(keyWord))) {
            ioHtmlElement.style.borderColor = ifMatchBrdr;
            console.log(ioHtmlElement);
            ioHtmlCnt.setAttribute("open", ""); //Se muestra el mes
            continue;
        }
        ioHtmlElement.style.borderColor = ifNotMatchBrdr;
        ioHtmlCnt.removeAttribute("open"); //Se oculta el mes
    }
};
/* -------------------------------------- */

/* Funcion para identificar cuando se alcance el maximo de informacion para el input file */
const maxFileSizeReached = (inptFiles) => {
    let totSize = 0;
    for (let file of inptFiles) totSize += file.size;
    const maxAllowedSize = 3 * 1024 * 1024; //3MB
    return totSize > maxAllowedSize ? true : false;
};
/* -------------------------------------------------------------------------------------- */

/* Funcion para obtener el indice del mes por su nombre */
const getMonthIndx = (monthName) => global.months.findIndex((month) => month == monthName);
/* ---------------------------------------------------- */

/* Funcion para repetir el io en los meses que corresponde */
const repeatIoInMonths = (months, io) => {
    const dateArr = io.date.split("/");
    for (let month of months) {
        //Para cada mes en el que se tiene que agregar el io
        const monthIndx = `${global.frmtDate(getMonthIndx(month) + 1)}`; //Se obtiene el indice del mes + 1 y se convierte en string
        const newDate = `${monthIndx}/${dateArr[1]}/${dateArr[2]}`; //Se crea una nueva fecha con el mes correspondiente
        const newIo = {
            //Se crea un nuevo io con el nuevo mes y nueva fecha
            ...io,
            id: global.genNewId(), //Se genera un nuevo id para cada io
            date: newDate,
            month,
        };
        global.iosArr.push(newIo); //Se guarda el io en el arreglo
        const ioMonth = document.querySelector(`.${month}`); //El contenedor segun el mes de los inoutcomes
        ioMonth.appendChild(createIoHtml(newIo)); //Se inserta el io en la interfaz grafica
        calcMonthBalance(month); //Se vuelve a calcular el balance del mes
    }
    dbFuncs.saveIoArrOnLS(); //Se almacena el arreglo en el almacenamiento local
    fbFuncs.saveOnFb(global.iosArr, global.yearToLoad); //Se almacena el array en firebase tambien
};
/* ------------------------------------------------------- */

/* Funcion para obtener los meses en los que se tiene que repetir un io */
const getMonthsToRepeat = (repeatEach, ioToRepeat) => {
    let monthInNum = ioToRepeat.date.split("/")[0] - 1; //Se obtiene el mes del io en numero y como indice de arreglo
    const repeatIoInMonths = []; //Arreglo para almacenar los meses en los que se tiene que repetir el io
    const monthToStart = (monthInNum += Number(repeatEach)); //No se cuenta el mes desde el que se agrego el io
    if (monthToStart > 12) return []; //Si el mes desde el que se va a empezar a contar es mayor a 12
    for (monthToStart; monthInNum < 12; monthInNum += Number(repeatEach)) {
        //A partir del mes del io, mientras aun hayan meses se le suma la frecuencia de repeticion que selecciono el usuario
        if (monthInNum > 12) break; //Si se pasa de los 12 meses disponibles se termina el bucle
        repeatIoInMonths.push(global.months[monthInNum]);
    }
    return repeatIoInMonths;
};
/* -------------------------------------------------------------------- */

export {
    calcYearBalance,
    calcMonthBalance,
    createIoHtml,
    filterByMonthName,
    filterShowAll,
    searchOnIos,
    getParsedIoFiles,
    maxFileSizeReached,
    repeatIoInMonths,
    getMonthsToRepeat,
};
