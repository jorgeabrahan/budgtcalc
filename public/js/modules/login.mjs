import * as global from "./global.mjs";
import * as fbFuncs from "./fb-funcs.mjs";
import * as dbFuncs from "./db-funcs.mjs";
import * as fbImports from "./fb-imports.mjs";
import * as modal from "./modal.mjs";


/* Funcion para validar el correo y la contraseña al iniciar sesion */
const validateLoginFrm = (mailInpt, paswrdInpt) => {
    const regexMailValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regexMailValidation.test(mailInpt.value.toLowerCase())) return 'El correo no tiene el formato correcto: ejemplo@correo.com';
    if (paswrdInpt.value.length < 8) return 'La contraseña debe tener un minimo de 8 caracteres';
    return '';
}
/* ---------------------------------------------------------------- */

/* Funcion para realizar acciones al iniciar sesion correctamente */
const onSuccessfulLogin = async ({ uid, email }) => {
    global.btnShowPopupLogin.classList.add('d-none'); //Se oculta el boton que muestra el modal para iniciar sesion
    //Solo si se esta visualizando el anio actual
    if (!global.otherYearView) global.btnLogout.classList.remove('d-none'); //Se muestra el boton para finalizar la sesion
    global.btnShowPrevBudgts.classList.remove('d-none'); //Se muestra el boton para ver el presupuesto de otros años
    global.frmAdd.inptRepeat.parentElement.classList.remove('d-none'); //Se muestra el contenedor del input repetir al iniciar sesion
    global.frmAdd.inptFile.parentElement.classList.remove('d-none'); //Se muestra el contenedor del input file al iniciar sesion
    
    global.userLogedHtml.textContent = email; //Se muestra el correo del usuario que inicio sesion

    const fbData = await fbFuncs.getDataFromFb(uid, global.yearToLoad);
    global.setFbDataActYear(fbData ? fbData : {data: []});  //Si la informacion recibida de la base de datos es undefined entonces se declara como un arreglo vacio

    //Si se esta visualizando otro anio que NO es el actual
    if (global.otherYearView) global.setIosArr([]); //Se limpia el arreglo del almacenamiento local que contiene los ios del anio actual
    
    const mergedArrs = fbFuncs.mergeArrWithLSArr(global.fbDataActYear.data); //Unificar el array de firebase con el del almacenamiento local
    fbFuncs.saveOnFb(mergedArrs, global.yearToLoad); //Se almacena el array unificado en firebase
    
    global.setIosArr(mergedArrs); //Se actualiza el arreglo
    
    dbFuncs.saveIoArrOnLS(); //Se guarda en el almacenamiento local

    //Se cargan los ios en la interfaz
    dbFuncs.loadIos();
}
/* -------------------------------------------------------------- */

/* Acciones a realizar al cerrar la sesion del usuario */
const onLogout = () => {
    localStorage.removeItem('userInfo');//Se elimina la informacion del usuario del almacenamiento local
    localStorage.removeItem('View');//Se elimina la informacion del usuario del almacenamiento local
    global.btnShowPopupLogin.classList.remove('d-none'); //Se muestra el boton que muestra el modal para iniciar sesion
    global.btnLogout.classList.add('d-none'); //Se oculta el boton para finalizar la sesion
    global.btnShowPrevBudgts.classList.add('d-none'); //Se oculta el boton para ver el presupuesto de otros años
    global.frmAdd.inptRepeat.parentElement.classList.add('d-none'); //Se oculta el contenedor del input repetir al iniciar sesion
    global.frmAdd.inptFile.parentElement.classList.add('d-none'); //Se oculta el contenedor del input file al iniciar sesion

    global.userLogedHtml.textContent = ''; //Se borra el usuario que tenia la sesion iniciada
    
    if (global.iosArr.length === 0) return; //Si el arreglo con los ios esta vacio no se hace nada

    /* Si se agregaron ios con la sesion iniciada */
    const modalDesc = 'Inicia sesión para acceder a tu información nuevamente.';
    modal.shwModal('Almacenamiento de información', modalDesc);
    dbFuncs.deleteAllIos(); //Se eliminan todos los ios de la interfaz y del arreglo y se almacena en el almacenamiento local
    /* ------------------------------------------ */
}
/* --------------------------------------------------- */

/* Funcion para iniciar sesion en firebase */
const logUser = (mailInpt, paswrdInpt) => {
    global.frmLoginMsg.textContent = 'Espere mientras se inicia sesión.';
    fbImports.signInWithEmailAndPassword(fbImports.fbAuth, mailInpt.value, paswrdInpt.value)
        .then(async (userCredential) => {
            const {uid, email} = userCredential.user;
            const userInfo = { uid, email };
            
            global.setUserLoged(userInfo);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            await onSuccessfulLogin(userInfo);
            
            mailInpt.value = '';
            paswrdInpt.value = '';
            
            global.loginPopup.classList.add('d-none'); //Se oculta el popup para iniciar sesion
            global.frmLogin.style.pointerEvents = 'all'; //Se vuelven a establecer los eventos tras haber iniciado sesion en el formulario
            global.frmLoginMsg.textContent = '';//Se limpia el mensaje del formulario de inicio de sesion
        })
        .catch(err => {
            const errCode = err.code;
            console.log(errCode)
            switch (errCode) {
                case 'auth/wrong-password':
                    global.frmLoginMsg.textContent = 'La contraseña no es correcta';
                    break;
                case 'auth/user-not-found':
                    global.frmLoginMsg.textContent = 'El usuario no se encontro, puede ser debido a que el correo este incorrecto';
                    break;
                case 'auth/internal-error':
                    global.frmLoginMsg.textContent = 'El servidor de autenticacion encontro un error inesperado al procesar la solicitud. Intenta mas tarde';
                    break;
                default:
                    global.frmLoginMsg.textContent = `Se dio un error desconocido, reporta el problema con este error: ${errCode}`;
                    break;
            }
        })
}
/* --------------------------------------- */

export { validateLoginFrm, onSuccessfulLogin, onLogout, logUser };
