import * as dbFuncs from "./db-funcs.mjs";
import * as fbFuncs from "./fb-funcs.mjs";
import * as ioFuncs from "./io-funcs.mjs";
import * as modal from "./modal.mjs";

/* Codigo relacionado con importaciones de firebase */
let fbDataActYear; //Se define un arreglo para almacenar la informacion que se reciba de la base de datos del año actual
const setFbDataActYear = (data) => (fbDataActYear = data);

let userLoged = JSON.parse(localStorage.getItem("userInfo"));
const setUserLoged = (user) => (userLoged = user);
const userLogedHtml = document.getElementById("userLogedHtml");
/* ------------------------------------------------ */

//Se declaran variables globales
const currFrmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "HNL" });
const rfrmtCurr = /[a-zA-Z\,\s]/g;

const loadIoArrFromLS = () => JSON.parse(localStorage.getItem("inoutcomes")) || [];
let iosArr = loadIoArrFromLS();
const setIosArr = (newArr) => (iosArr = newArr);

/* Obtener la fecha actual */
const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

const frmtDate = (valToFrmt) => (valToFrmt < 10 ? `0${valToFrmt}` : valToFrmt.toString());
const date = new Date();
let yearToLoad = date.getFullYear().toString();
const setYearToLoad = (newYear) => (yearToLoad = newYear); //Funcion para cambiar el anio a cargar
const actMnthName = months[date.getMonth()];
const actMnth = frmtDate(date.getMonth() + 1);
const actDate = frmtDate(date.getDate());
/* ----------------------- */

/* Se obtienen todas las cookies al cargar la pagina y se almacenan en un arreglo */
const cookies = [];
for (let cookie of document.cookie.split(";")) {
    const cookieSpltd = cookie.trim().split("=");
    cookies.push({ name: cookieSpltd[0], value: cookieSpltd[1] });
}
/* ------------------------------------------------------------------------------ */

/* Funcion para crear un id */
const genNewId = () => {
    let ID = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 62; i++) ID += characters.charAt(Math.floor(Math.random() * 62));
    return ID;
};
/* ------------------------- */

const frmEdit = document.getElementById("frmEdit"); //Formulario para editar un io
const frmEditMsg = document.getElementById("frmEditMsg"); //Mensaje del formulario para editar

const cntMonths = document.getElementById("cntMonths"); //Contenedor de los meses en el DOM

/* Elementos para mostrar la previsualizacion de los archivos ingresados */
const docsPopup = document.getElementById("docsPopup");
const docsBtns = document.getElementById("docsBtns");
const docsViewer = document.getElementById("docsViewer");
const docsGoBack = document.getElementById("docsGoBack");
docsGoBack.addEventListener("click", () => {
    dbFuncs.loadDocsViewer();
});
/* ---------------------------------------------------------------------- */

const frmAdd = document.getElementById("frmAdd");
const frmAddMsg = document.getElementById("frmAddMsg");
/* Establecer la fecha actual en el input del formulario */
const setFrmAddActDate = () => {
    frmAdd.inptDate.min = `${yearToLoad}-01-01`;
    frmAdd.inptDate.max = `${yearToLoad}-12-31`;
    frmAdd.inptDate.value = `${yearToLoad}-${actMnth}-${actDate}`;
};
/* ----------------------------------------------------- */

const inptFltrByMnth = document.getElementById("inptFltrByMnth"); //Se obtiene el input para filtrar por mes

/* Codigo para cuando se este visualizando un anio que no sea el actual */
const selectedYear = localStorage.getItem("View") || yearToLoad; //Se intenta obtener el anio a visualizar y si no existe se establece el actual
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
    for (let option of inptFltrByMnth.options) if (option.value === "actual") option.classList.add("d-none"); //Se oculta el filtrador del mes actual
    modal.shwModal("Modo de visualizacion", modalMsg);
    setYearToLoad(selectedYear); //Se establece el anio actual como el anio a visualizar
    otherYearView = true; //Se esstablece como verdadero a que se esta visualizando otro anio que no es el actual
}
/* -------------------------------------------------------------------- */

/* Al subir archivos en el input file */
frmAdd.inptFile.addEventListener("change", () => {
    if (ioFuncs.maxFileSizeReached(frmAdd.inptFile.files))
        frmAddMsg.innerText = "El peso de los archivos sobrepasa los 3MB, intente comprimirlos o subir otros archivos.";
    else frmAddMsg.innerText = "";
});
/* ---------------------------------- */

/* Al cambiar el input repetir */
frmAdd.inptRepeat.addEventListener("change", () => {
    frmAddMsg.textContent = "";
    frmAdd.inptFile.parentElement.classList.remove("d-none");
    if (frmAdd.inptRepeat.value != "nunca") {
        frmAddMsg.textContent =
            "Aviso: No se permiten agregar archivos en montos que se repiten, asi se evita que se suba el mismo archivo varias veces a la base de datos.";
        frmAdd.inptFile.parentElement.classList.add("d-none");
        frmAdd.inptFile.value = "";
    }
});
/* --------------------------- */

const btnNewBudg = document.getElementById("btnNewBudg"); // Boton para crear un nuevo presupuesto y si tiene la sesion iniciada archivarlo en todos los años

const frmLogin = document.getElementById("frmLogin");
const frmLoginMsg = document.getElementById("frmLoginMsg");

const btnShowPopupLogin = document.getElementById("btnShowPopupLogin");
const loginPopup = document.getElementById("loginPopup");
btnShowPopupLogin.addEventListener("click", () => {
    loginPopup.classList.remove("d-none");
    frmLogin.inptMail.focus();
});

const btnLogout = document.getElementById("btnLogout");

const btnShowPrevBudgts = document.getElementById("btnShowPrevBudgts");

/* Funcion para revisar el input para agregar archivos al editar un io */
const checkInptAddFilesOnEdit = () => {
    //Se limpia el mensaje del formulario para editar
    frmEditMsg.textContent = "";
    /* Se llama funcion para verificar que no se sobrepase el peso maximo */
    if (ioFuncs.maxFileSizeReached(inptAddFiles.files)) {
        frmEditMsg.textContent = "El peso de los archivos sobrepasa los 1.5MB, intente comprimiendolos o subiendo otros archivos.";
        return true;
    }
    /* Se suman los archivos que se agregaron con los que ya tenia el io */
    const ioFiles = dbFuncs.getIoFromArr(frmEdit.getAttribute("key-edit")).files;
    const totalFiles = frmEdit.inptAddFiles.files.length + ioFiles.length;
    //Si se han agregado mas de 10 archivos
    if (totalFiles > 10) {
        frmEditMsg.textContent = "Se ha excedido la cantidad maxima de archivos para cada monto. Debes agregar menos de 10 en total.";
        return true;
    }

    //Se verifica que el nombre de alguno de los archivos subidos no exista ya en la base de datos
    for (let file of ioFiles) {
        //Por cada archivo que ya tiene el io
        for (let newFile of frmEdit.inptAddFiles.files) {
            //Por cada nuevo archivo a subir
            if (file.name === newFile.name) {
                //Si se encuentra un archivo con el mismo nombre
                frmEditMsg.textContent = `Ya existe un archivo con el nombre ${file.name} para este monto, prueba a cambiar el nombre en caso de que sea un archivo diferente.`;
                return true;
            }
        }
    }
    return false;
};
/* ------------------------------------------------------------------- */

/* Input para agregar archivos al editar un io */
frmEdit.inptAddFiles.addEventListener("change", () => {
    checkInptAddFilesOnEdit();
});
/* ------------------------------------------- */

/* Boton para eliminar archivos del io cuando se esta editando */
const btnDeleteFile = document.getElementById("btnDeleteFile");
const afterDeletingFileFromStorage = (io, fileName) => {
    dbFuncs.deleteFileFromIo(io, fileName); //Se llama una funcion para eliminar el archivo del arreglo de archivos

    //Se muestra mensaje de exito por 4 segundos
    frmEditMsg.textContent = `El archivo ${fileName} se elimino exitosamente.`;
    setTimeout(() => {
        frmEditMsg.textContent = "";
        //Se establecen los eventos al input y al boton de nuevo
        frmEdit.inptDeleteFile.style.pointerEvents = "all";
        btnDeleteFile.style.pointerEvents = "all";
    }, 5000);

    //Se elimina la opcion del archivo del select
    for (let opt of frmEdit.inptDeleteFile.options) if (opt.value === fileName) opt.remove();

    //Si se eliminaron todos los archivos del io
    if (io.files.length === 0) {
        const ioHtmlCnt = document.getElementById(io.id);
        const ioHeaderHtml = ioHtmlCnt.querySelector(".inoutcome__header");
        const ioButtons = ioHeaderHtml.querySelector(".income__buttons"); //Se obtienen los botones del header del io
        const ioFileBtn = ioButtons.querySelector(".file-btn"); //Se obtiene el boton de los archivos
        //Si existe
        if (ioFileBtn) ioFileBtn.remove(); //Se elimina

        //Se oculta el contenedor del input para eliminar archivos
        frmEdit.inptDeleteFile.parentElement.classList.add("d-none");
        //Se oculta el boton para eliminar archivos
        btnDeleteFile.classList.add("d-none");
    }
};

btnDeleteFile.addEventListener("click", () => {
    //Se obtiene el io que contiene el archivo a eliminar
    const io = dbFuncs.getIoFromArr(frmEdit.getAttribute("key-edit"));
    const fileNameToDelete = frmEdit.inptDeleteFile.value;
    //Se quitan los eventos al input para seleccionar un elemento para eliminar y el boton para eliminar archivos
    frmEdit.inptDeleteFile.style.pointerEvents = "none";
    btnDeleteFile.style.pointerEvents = "none";

    //Al eliminar un archivo si ya no quedan documentos tengo que uqitar el boton para previsualizar documentos de la interfaz del monto

    frmEditMsg.textContent = `Espere mientras se elimina el archivo ${fileNameToDelete} de la base de datos.`;
    //Se llama una funcion para eliminar el archivo de la base de datos
    fbFuncs.deleteFileFromStorage(io, fileNameToDelete, afterDeletingFileFromStorage);
});
/* ----------------------------------------------------------- */

export {
    currFrmt,
    rfrmtCurr,
    iosArr,
    yearToLoad,
    setYearToLoad,
    actMnth,
    actMnthName,
    actDate,
    otherYearView,
    cookies,
    genNewId,
    frmEdit,
    frmEditMsg,
    checkInptAddFilesOnEdit,
    months,
    frmtDate,
    cntMonths,
    docsPopup,
    docsGoBack,
    docsBtns,
    docsViewer,
    frmAdd,
    frmAddMsg,
    setFrmAddActDate,
    inptFltrByMnth,
    btnNewBudg,
    btnShowPopupLogin,
    loginPopup,
    btnLogout,
    btnShowPrevBudgts,
    frmLogin,
    frmLoginMsg,
    fbDataActYear,
    setFbDataActYear,
    userLoged,
    userLogedHtml,
    setIosArr,
    setUserLoged,
    btnDeleteFile,
};
