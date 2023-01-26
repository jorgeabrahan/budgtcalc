"use strict";

import * as global from "./modules/global.mjs";
import * as modal from "./modules/modal.mjs";
import * as dbFuncs from "./modules/db-funcs.mjs";
import * as ioFuncs from "./modules/io-funcs.mjs";
import * as fbFuncs from "./modules/fb-funcs.mjs";
import * as loginFuncs from "./modules/login.mjs";
import * as theme from "./modules/theme.mjs";

theme.selectInptTheme(theme.prevTheme); //Se selecciona el tema correspondiente en el input
theme.setTheme(theme.prevTheme); //Se establece el tema seleccionado al cargar

/* Se obtiene el formulario para agregar un inoutcome */
const dateHtml = document.querySelector(".date");
//Si se esta visualizando otro anio que no es el actual
if (global.otherYearView) dateHtml.textContent = `${global.yearToLoad}`; //Solo se muestra el anio
else {
    //Si se esta visualizando el anio actual
    dateHtml.textContent = `${global.actDate} ${global.actMnthName} ${global.yearToLoad}`; //Se muestra la fecha completa
    document.querySelector(`.${global.actMnthName}`).parentElement.setAttribute("open", ""); //Se abre el mes actual
}
/* ----------------------------------------------------- */

/* Funcion a ejecutar cuando se agregue un io y despues de que se suban los archivos */
const saveAndLoadIo = (io) => {
    global.iosArr.push(io); //Se guarda el io en el arreglo
    dbFuncs.newIo(io); //Se crea el io en la interfaz
};
/* --------------------------------------------------------------------------------- */

/* Al agregar un inoutcome */
global.frmAdd.addEventListener("submit", async (e) => {
    e.preventDefault();
    global.frmAddMsg.textContent = "";

    for (let inpt of global.frmAdd) {
        if (inpt.value !== "") continue;
        if (inpt.type === "file") continue; //El input file no es obligatorio
        global.frmAddMsg.textContent = "Debes llenar todos los campos."; // Si hay inputs vacios
        return;
    }

    //Si se sobrepasa el peso maximo de los archivos
    if (ioFuncs.maxFileSizeReached(global.frmAdd.inptFile.files)) {
        global.frmAddMsg.textContent = "El peso de los archivos sobrepasa los 3MB, intente comprimiendolos o subiendo otros archivos.";
        return;
    }

    //Si se excede la cantidad maxima de archivos por cada monto
    if (global.frmAdd.inptFile.files.length > 10) {
        global.frmAddMsg.textContent = "Se ha sobrepasado la cantidad maxima de archivos permitida por cada monto (10).";
        return;
    }

    e.target.style.pointerEvents = "none"; //Se quitan los eventos al formulario

    //Se obtiene la fecha del inoutcome del input del formulario
    const inptDate = global.frmAdd.inptDate.value.split("-");
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
    };

    //Si el io se repite
    if (global.frmAdd.inptRepeat.value != "nunca")
        ioFuncs.repeatIoInMonths(ioFuncs.getMonthsToRepeat(global.frmAdd.inptRepeat.value, io), io);

    //Si el io tiene archivos
    if (global.frmAdd.inptFile.files.length > 0) {
        global.frmAddMsg.textContent = "Espere mientras se suben los archivos a la base de datos.";
        await fbFuncs.saveIoFilesOnStorage(io.id, global.frmAdd.inptFile.files); //Se almacenan los archivos en el storage
        //Se obtiene los archivos del storage, se almacenan en el arr de files y se guardan los cambios en el arreglo y la interfaz
        fbFuncs.getSrcFilesFromStorage(io, saveAndLoadIo);
        global.frmAddMsg.textContent = "";
    } else {
        //Si el io no tiene archivos
        global.iosArr.push(io); //Se guarda el io en el arreglo
        dbFuncs.newIo(io); //Se crea el io en la interfaz
    }

    /* Limpiar campos del formulario */
    global.frmAdd.reset();
    for (let opt of global.frmAdd.inptType.options) {
        if (opt.value === io.type) opt.setAttribute("selected", "");
        else opt.removeAttribute("selected", "");
    }
    global.setFrmAddActDate();
    /* ----------------------------- */

    global.frmAdd.inptFile.parentElement.classList.remove("d-none");

    e.target.style.pointerEvents = "all"; //Se vuelven a poner los eventos al formulario
    global.frmAdd.inptId.focus();
});
/* ----------------------- */

/* Funcion a ejecutar una vez se pasen todos los filtros del formulario para editar io */
const createIoEdited = (io) => {
    const ioEdited = {
        ...io,
        files: io.files,
        type: global.frmEdit.inptNewType.value,
        name: global.frmEdit.inptNewId.value,
        id: global.frmEdit.getAttribute("key-edit"),
        description: global.frmEdit.inptNewDesc.value,
        amount: Number(global.frmEdit.inptNewAmount.value),
    };
    dbFuncs.editIo(ioEdited);
    //Se vuelven a habilitar los eventos del formulario de edicion
    global.frmEdit.style.pointerEvents = "all";
};
/* ----------------------------------------------------------------------------------- */

/* Al editar un inoutcome */
global.frmEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    /* Si hay inputs vacios */
    global.frmEditMsg.textContent = "";
    for (let inpt of global.frmEdit) {
        if (inpt.id === "inptDeleteFile" || inpt.id === "inptAddFiles" || inpt.id === "btnDeleteFile") continue;
        if (inpt.value !== "") continue;
        global.frmEditMsg.textContent = "Llena todos los campos";
        return;
    }
    /* -------------------- */

    //Se quitan los eventos del formulario de edicion
    e.target.style.pointerEvents = "none";

    const prevIoData = dbFuncs.getIoFromArr(global.frmEdit.getAttribute("key-edit"));

    //Si agrego archivos al io
    if (global.frmEdit.inptAddFiles.files.length) {
        if (global.checkInptAddFilesOnEdit()) return; //Si se excede el maximo de 10 archivos o el peso maximo de 1.5MB no se edita el io
        global.frmEditMsg.textContent = "Espere mientras se suben los archivos a la base de datos.";
        //Se suben los nuevos archivos a la base de datos
        await fbFuncs.saveIoFilesOnStorage(prevIoData.id, global.frmEdit.inptAddFiles.files);
        //Se obtienen los archivos del io
        fbFuncs.getSrcFilesFromStorage(prevIoData, createIoEdited);
        return;
    }

    createIoEdited(prevIoData);
    global.frmEdit.parentElement.classList.add("d-none"); //Se oculta el formulario
});

/* Al agregar un nuevo presupuesto */
global.btnNewBudg.addEventListener("click", () => {
    /* Mostrar modal para confirmar */
    const msgHeader = "Nuevo presupuesto";
    const msgBody = `¿Estas seguro que deseas archivar el presupuesto de el año pasado y comenzar uno nuevo?`;
    const msgBtnText = "Crear nuevo";
    modal.shwModal(msgHeader, msgBody, dbFuncs.whenYearEnds, msgBtnText);
});
/* ------------------------------- */

/* Filtrar los meses del DOM */
global.inptFltrByMnth.addEventListener("change", () => {
    switch (inptFltrByMnth.value) {
        case "todos":
            ioFuncs.filterShowAll();
            break;
        case "actual":
            ioFuncs.filterByMonthName(global.actMnthName.toLowerCase());
            break;
        default: //Si se filtra por un mes en especifico
            ioFuncs.filterByMonthName(inptFltrByMnth.value);
            break;
    }
});
/* -------------------------- */

/* Al realizar una busqueda en los ios */
const frmSearch = document.getElementById("frmSearch");
frmSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    ioFuncs.searchOnIos(frmSearch.inptFltrSrch.value.toLowerCase());
    document.getElementById(global.actMnthName.toLowerCase()).setAttribute("open", "");
});
/* ----------------------------------- */

/* Al hacer un sumit del formulario para iniciar sesion */
global.frmLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    global.frmLogin.style.pointerEvents = "none"; //Se quitan todos los eventos para que no se llame la funcion de iniciar sesion varias veces

    global.frmLoginMsg.innerText = ""; //Se limpia el mensaje del formulario

    global.frmLoginMsg.innerText = loginFuncs.validateLoginFrm(global.frmLogin.inptMail, global.frmLogin.inptPaswrd);
    if (global.frmLoginMsg.innerText !== "") return; //Si hay algun error al validar los campos correo y contraseña

    loginFuncs.logUser(global.frmLogin.inptMail, global.frmLogin.inptPaswrd);
});
/* ---------------------------------------------------- */

/* Al hacer click en cerrar sesion debe terminar la sesion en firebase y borrar la informacion del LS */
global.btnLogout.addEventListener("click", () => {
    loginFuncs.onLogout();
});
/* -------------------------------------------------------------------------------------------------- */

const btnDeleteAllIos = document.getElementById("btnDeleteAllIos");
btnDeleteAllIos.addEventListener("click", () => {
    modal.shwModal(
        "Eliminar el año",
        "Esta seguro que desea eliminar toda la informacion de este año.",
        fbFuncs.deleteYear,
        "Eliminar año"
    );
});
