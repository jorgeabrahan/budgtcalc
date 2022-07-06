'use strict';

import * as global from './global.mjs';
import * as ioFuncs from './io-funcs.mjs';
import * as fbFuncs from './fb-funcs.mjs';
import * as loginFuncs from './login.mjs';
import * as modal from './modal.mjs';

/* Para cuando sea un nuevo anio */
const ifNewYear = year => {
    if (year == global.yearToLoad) return; //Si aun no ha terminado el anio
    
    //Si ya es un nuevo anio
    global.setYearToLoad(year); //Se establece el anio a cargar como el pasado para que se puedan seguir agregando montos a ese anio
    global.btnNewBudg.classList.remove('d-none');//Se muestra el boton para un nuevo presupuesto
    const msgHeader = '¡El año ha terminado!';
    const msgBody = `Para comenzar un nuevo presupuesto de este año da clic en el boton "nuevo presupuesto" en la parte superior de la página.`;
    modal.shwModal(msgHeader, msgBody);
}

const getYearFromLS = () => {
    const pastYear = localStorage.getItem('year');
    if (!pastYear) { //Si no existe el anio
        localStorage.setItem('year', global.yearToLoad);
        return;
    }
    ifNewYear(pastYear);
}
/* -------------------------------- */

const saveIoArrOnLS = () => localStorage.setItem('inoutcomes', JSON.stringify(global.iosArr));
/* Get from array functions */
const getIoFromArr = id => global.iosArr.find(io => io.id === id);
const getIoIndxFromArr = id => global.iosArr.findIndex(io => io.id === id);
/* ----------------------- */
const removeIoFromArr = indx => global.iosArr.splice(indx, 1);
const onChangeOfArr = month => {
    saveIoArrOnLS();
    //Si el usuario inicio sesion
    if (global.userLoged) fbFuncs.saveOnFb(global.iosArr, global.yearToLoad); //Se almacena el array en firebase tambien
    ioFuncs.calcMonthBalance(month);
}


const isMobile = () => window.innerWidth < 720;

/* Funciones para la visualizacion de documentos */
const createFilePdf = file => {
    if (isMobile()) {
        const warn = document.createElement('div');
        warn.innerHTML = `
            <p>No se pueden previsualizar pdfs en mobiles. Puedes abrirlo en tu ordenador o descargar el archivo.</p>
            <a href="${file.src}" download="${file.name}"><span class="material-icons">file_download</span> ${file.name}</a>
        `;
        return warn;
    }
    
    const filePdf = document.createElement('embed');
    filePdf.src = file.src;
    filePdf.type = `application/${file.fileExt}`;
    filePdf.title = file.name;
    return filePdf;
}
const createFileImg = file => {
    const fileImg = document.createElement('img');
    fileImg.src = file.src;
    return fileImg;
}
const showFilePrev = file => {
    global.docsBtns.classList.add('d-none'); //Ocultar los botones de los archivos
    global.docsViewer.classList.remove('d-none'); //Mostrar el viewer de los archivos
    global.docsViewer.innerHTML = ''; //Se limpia el visualizador de documento
    global.docsGoBack.classList.remove('d-none');

    if (file.fileExt !== 'pdf') {//Si el archivo es una imagen
        global.docsViewer.appendChild(createFileImg(file));
        return;
    }
    //Si el archivo es un pdf
    global.docsViewer.appendChild(createFilePdf(file));
}
const createFileBtn = file => {
    const fileBtn = document.createElement('button');
    fileBtn.className = 'form__button docs__file';
    fileBtn.innerHTML = `
        ${file.name}
        <span class="material-icons">east</span>
    `;
    fileBtn.addEventListener('click', () => showFilePrev(file));
    return fileBtn;
}

/* Cargar el viewer de los docs con la vista predeterminada */
const loadDocsViewer = () => {
    global.docsGoBack.classList.add('d-none');
    global.docsBtns.classList.remove('d-none');
    global.docsViewer.classList.add('d-none');
    global.docsViewer.innerHTML = '';
}
/* -------------------------------------------------------- */
/* Mostrar los botones de los archivos del io */
const showDocsPrev = (io) => {
    global.docsPopup.classList.remove('d-none'); //Se muestra el popup con los enlaces de los documentos
    loadDocsViewer();
    global.docsBtns.innerHTML = '';
    const filesFragment = document.createDocumentFragment();
    for (let file of io.files) filesFragment.appendChild(createFileBtn(file));
    global.docsBtns.appendChild(filesFragment);
}
/* --------------------------------------------- */


/* Se realizan los cambios de edicion en el io */
const editIo = (io) => {
    /* Se actualiza el objeto en la interfaz */
    const ioHtmlCnt = document.getElementById(io.id);
    const ioAmountHtml = ioHtmlCnt.querySelector('.inoutcome__amount');
    const ioNameHtml = ioHtmlCnt.querySelector('.inoutcome__name');
    const ioDescHtml = ioHtmlCnt.querySelector('.inoutcome__description');
    const ioDateHtml = ioHtmlCnt.querySelector('.inoutcome__date');
    const ioHeaderHtml = ioHtmlCnt.querySelector('.inoutcome__header');
    const ioButtons = ioHeaderHtml.querySelector('.income__buttons');

    //Si el io tiene archivos
    if (io.files.length) {
        const ioFileBtn = ioButtons.querySelector('.file-btn');
        //Si ya tiene el boton de archivos
        if (ioFileBtn) ioFileBtn.remove(); //Se elimina
        //Se crea un boton para visualizar los archivos
        const newFileBtn = document.createElement('button');
        newFileBtn.className = 'file-btn';
        newFileBtn.innerHTML = `<span class="material-icons">description</span>`;
        newFileBtn.addEventListener('click', () => { showDocsPrev(io) });
        ioButtons.prepend(newFileBtn);
    }

    ioAmountHtml.textContent = global.currFrmt.format(io.amount);
    ioNameHtml.textContent = io.name;
    ioDescHtml.textContent = io.description;
    ioDateHtml.textContent = io.date;
    ioHeaderHtml.className = `inoutcome__header inoutcome__header--${io.type} ${io.type}`;
    /* --------------------------------------- */

    /* Se actualiza el arreglo */
    global.iosArr[getIoIndxFromArr(io.id)] = { ...io };
    /* Se guardan los cambios */
    onChangeOfArr(io.month);
    /* ----------------------- */
    global.frmEdit.parentElement.classList.add('d-none');
}
/* ------------------------------------------- */

/* Se muestra el formulario para editar */
const shwEditFrm = io => {
    //Se vacia el mensaje de los errores del formulario de edicion que puede contener informacion previa
    global.frmEditMsg.textContent = '';
    
    global.frmEdit.parentElement.classList.remove('d-none');//Se muestra el formulario
    //Se establece la fecha y el id como atributo del formulario de edicion
    global.frmEdit.setAttribute('key-edit', io.id);

    for (let option of global.frmEdit.inptNewType) {
        option.removeAttribute('selected', '');
        if (option.value === io.type) option.setAttribute('selected', ''); //Se selecciona de las opciones si es ingreso o egreso
    }

    //Se oculta el contenedor del input para eliminar archivos
    global.frmEdit.inptDeleteFile.parentElement.classList.add('d-none');
    //Se limipia el input para eliminar archivos
    global.frmEdit.inptDeleteFile.innerHTML = '';
    //Se oculta el boton para eliminar archivos
    global.btnDeleteFile.classList.add('d-none');

    //Si el io tiene archivos
    if (io.files.length > 0) {
        //Se muestra el input para eliminar archivos y el boton
        global.frmEdit.inptDeleteFile.parentElement.classList.remove('d-none');
        global.frmEdit.inptDeleteFile.innerHTML = ''; //Se limpia el select antes de meter las opciones
        const fileOptsFrgmnt = document.createDocumentFragment();
        //Para cada archivo del io
        for (let file of io.files) {
            //Se crea una opcion para agregar en el input
            const fileOpt = document.createElement('option');
            fileOpt.value = file.name;
            fileOpt.textContent = file.name;
            fileOptsFrgmnt.appendChild(fileOpt); //Se meten todas las opciones en un document fragment
        }
        //Se mete el document fragment con las opciones de los archivos a eliminar en el select
        global.frmEdit.inptDeleteFile.appendChild(fileOptsFrgmnt);
        //Se muestra el boton para eliminar el archivo seleccionado
        global.btnDeleteFile.classList.remove('d-none');
    }

    //Se oculta el input para subir mas archivos
    global.frmEdit.inptAddFiles.parentElement.classList.add('d-none');

    //Si tiene menos de 10 archivos subidos y tiene iniciada la sesion
    if (io.files.length < 10 && global.userLoged) {
        global.frmEdit.inptAddFiles.value = '';
        global.frmEdit.inptAddFiles.parentElement.classList.remove('d-none'); //Se muestra el input para subir mas archivos
    }

    // Se rellena el formulario con los valores actuales
    global.frmEdit.inptNewType.value = io.type;
    global.frmEdit.inptNewId.value = io.name;
    global.frmEdit.inptNewDesc.value = io.description;
    global.frmEdit.inptNewAmount.value = io.amount;
}
/* ------------------------------------ */

/* Al eliminar un inoutcome */
const deleteIo = (id, delJustFromUI) => {
    const io = getIoFromArr(id);
    document.getElementById(id).remove(); //Se elimina el elemento de la interfaz
    if (!delJustFromUI) { //Si ademas de eliminarlo de la interfaz se quiere eliminar en el arreglo
        removeIoFromArr(getIoIndxFromArr(id)); //Se elimina del arreglo
        //Si tiene la sesion iniciada y el io tenia archivos
        if (global.userLoged && io.files.length > 0) fbFuncs.deleteFilesFromStorage(io); //Se eliminan los archivos de la base de datos
        onChangeOfArr(io.month);
    }
}
/* ----------------------- */

/* Eliminar todos los ios */
function deleteAllIos(delJustFromUI = true) {
    for (let io of global.iosArr) deleteIo(io.id, delJustFromUI); //Se elimina cada io solamente de la interfaz
    global.setIosArr([]); //Se vacía el arreglo que contiene los ios despues de haberlos eliminado de la interfaz
    for (let month of global.months) ioFuncs.calcMonthBalance(month); //Se vuelve a calcular el balance de todos los meses
}
/* ---------------------- */

/* Al crear un nuevo Inoutcome */
const newIo = io => {
    const ioMonth = document.querySelector(`.${io.month}`); //El contenedor segun el mes de los inoutcomes
    ioMonth.appendChild(ioFuncs.createIoHtml(io));
    onChangeOfArr(io.month);
}
/* --------------------------- */

/* Cargar los inoutcomes del local storage */
const loadIos = () => {for (let io of global.iosArr) newIo(io)};
/* --------------------------------------- */

/* Funcion a ejecutar para cuando el anio termine */
const whenYearEnds = () => {
    deleteAllIos(); //Se eliminan todos los ios del arreglo y la interfaz
    saveIoArrOnLS(); //Se guarda el arreglo en el almacenamiento local
    const actYear = new Date().getFullYear().toString(); //Se obtiene el anio actual
    localStorage.setItem('year', actYear); //Se establece el anio actual en el almacenamiento local
    global.setYearToLoad(actYear); //Se establece el anio a cargar como el anio actual
    modal.modalCnt.classList.add('d-none'); //Se oculta el modal que mostro el mensaje del nuevo presupuesto
}
/* ---------------------------------------------- */


/* Funcion para eliminar un archivo de un arreglo de archivos */
const removeFileFromFiles = (filesArr, fileIndx) => filesArr.splice(fileIndx, 1);
/* ---------------------------------------------------------- */

/* Funcion para obtener el indice del archivo a eliminar y eliminarlo */
const deleteFileFromIo = (io, fileName) => {
    //Por cada archivo del io que contiene el archivo a eliminar
    io.files.forEach((file, indx) => {
        //Si el archivo es el archivo a eliminar
        if (file.name === fileName) removeFileFromFiles(io.files, indx); //Se elimina el archivo de los archivos
    });
    //Despues de eliminar el archivo
    onChangeOfArr(io.month); //Se almacena el nuevo io con el archivo eliminado donde corresponde
}
/* ------------------------------------------------------------------ */

/* Cuando cargue el DOM */
window.onload = () => {
    //Si se esta visualizando el anio actual
    if (!global.otherYearView) getYearFromLS(); //Se determina si se esta en un anio nuevo
    global.setFrmAddActDate();
    if (global.userLoged) loginFuncs.onSuccessfulLogin(global.userLoged);
};
/* -------------------- */

export { saveIoArrOnLS, newIo, loadIos, shwEditFrm, editIo, deleteIo, deleteAllIos, getIoFromArr, getIoIndxFromArr, showDocsPrev, loadDocsViewer, whenYearEnds, deleteFileFromIo };
