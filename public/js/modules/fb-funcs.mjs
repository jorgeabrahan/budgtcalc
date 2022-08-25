import * as FIREBASE from "../imports/firebase.mjs";
import * as global from "./global.mjs";
import * as dbFuncs from "./db-funcs.mjs";
import * as ioFuncs from "./io-funcs.mjs";
import * as modal from "./modal.mjs";

/* Funcion para unificar el arreglo en la base de datos con el que esta en el almacenamiento local */
const mergeArrWithLSArr = (arrFromFb) => {
    const mergedArrs = [...global.iosArr];
    for (let io of arrFromFb) {
        const exists = dbFuncs.getIoIndxFromArr(io.id) == -1 ? false : true;
        if (!exists) {
            //Si no existe el io en el array del ls
            mergedArrs.push(io);
        }
    }
    return mergedArrs;
};
/* ----------------------------------------------------------------------------------------------- */

/* Funcion para eliminar un solo archivo del storage */
const deleteFileFromStorage = async (io, fileName, funcToExeAfter) => {
    const refToDelete = FIREBASE.storageFuncs.ref(
        FIREBASE.FBSTORAGE,
        `/images/${global.userLoged.uid}/${global.yearToLoad}/${io.id}/${fileName}`
    );
    await FIREBASE.storageFuncs
        .deleteObject(refToDelete)
        .then(() => {
            //Despues de eliminar el archivo si no hubo error
            funcToExeAfter(io, fileName);
        })
        .catch(() => {
            modal.shwModal(
                "Error al eliminar archivo",
                `Se dio un error al eliminar el archivo ${fileName} de la base de datos, recargue la pagina y compruebe si el archivo se elimino, si no, puede intentar de nuevo mas tarde.`
            );
        });
};

/* Funcion para eliminar archivo del storage */
const deleteFilesFromStorage = async (io) => {
    for (let file of io.files) {
        const refToDelete = FIREBASE.storageFuncs.ref(
            FIREBASE.FBSTORAGE,
            `/images/${global.userLoged.uid}/${global.yearToLoad}/${io.id}/${file.name}`
        );
        await FIREBASE.storageFuncs.deleteObject(refToDelete).catch(() => {
            modal.shwModal(
                "Error al eliminar archivo",
                `Se dio un error al eliminar el archivo ${file.name} de la base de datos, intente de nuevo mas tarde.`
            );
        });
    }
};
/* ----------------------------------------- */

/* Funcion para obtener el enlace de las imagenes en el storage */
const getSrcFilesFromStorage = (io, funcToDoAfterGettingFiles) => {
    io.files = []; //Se vacia el arreglo de los arcchivos del io

    const listRef = FIREBASE.storageFuncs.ref(FIREBASE.FBSTORAGE, `/images/${global.userLoged.uid}/${global.yearToLoad}/${io.id}`);
    FIREBASE.storageFuncs
        .listAll(listRef)
        .then((res) => {
            res.items.forEach(async (doc, indx, arr) => {
                await FIREBASE.storageFuncs
                    .getDownloadURL(doc)
                    .then((src) => {
                        const nameArr = doc.name.split(".");
                        const fileExt = nameArr[nameArr.length - 1];
                        io.files.push({
                            name: doc.name,
                            fileExt,
                            src,
                        });
                        //Cuando ya se hayan obtenido todos los archivos del storage
                        if (io.files.length === arr.length) funcToDoAfterGettingFiles(io);
                    })
                    .catch(() => {
                        modal.shwModal(
                            "Error al obtener archivo",
                            `El archivo ${doc.name} se almaceno correctamente en la base de datos pero ocurrio un problema al tratar de acceder a el.`
                        );
                        return;
                    });
            });
        })
        .catch(() => {
            modal.shwModal(
                "Error al obtener archivos",
                `Los archivos se almacenaron correctamente en la base de datos pero ocurrio un error al intentar obtenerlos.`
            );
        });
};
/* ------------------------------------------------------------ */

/* Funcion para subir los archivos del io al storage */
const saveIoFilesOnStorage = (ioId, files) => {
    return new Promise(async (resolve, reject) => {
        for (let file of files) {
            const storageRef = FIREBASE.storageFuncs.ref(
                FIREBASE.FBSTORAGE,
                `/images/${global.userLoged.uid}/${global.yearToLoad}/${ioId}/${file.name}`
            ); //Referencia para almacenar los files en el storage
            await FIREBASE.storageFuncs.uploadBytes(storageRef, file, { contentType: file.type }).catch((err) => {
                //Se suben al storage en la referencia indicada los archivos del io
                modal.shwModal(
                    "Error al subir archivo",
                    `Ocurrio un error al subir el archivo ${file.name} a la base de datos. Por favor intentalo de nuevo mas tarde.`
                );
                reject(err);
            });
        }
        resolve(); //Se resuelve la promesa despues de subir los archivos al storage
    });
};
/* ------------------------------------------------- */

const saveOnFb = (arrToSave, yearToSave) => {
    FIREBASE.firestoreFuncs
        .setDoc(FIREBASE.firestoreFuncs.doc(FIREBASE.FBDB, global.userLoged.uid, yearToSave), { data: [...arrToSave] })
        .catch(() => {
            modal.shwModal(
                "Error al subir monto",
                `Ocurrio un error al subir el monto que acabas de ingresar a la base de datos, porfavor intenta de nuevo mas tarde.`
            );
        });
};

/* Se obtiene la informacion para el año actual de la base de datos */
const getDataFromFb = (uid, year) => {
    return new Promise(async (resolve, reject) => {
        const docRef = FIREBASE.firestoreFuncs.doc(FIREBASE.FBDB, uid, year); //Se accede a una coleccion que tiene como nombre el uid y al documento del año actual
        const docSnap = await FIREBASE.firestoreFuncs.getDoc(docRef).catch((err) => {
            modal.shwModal(
                "Error al obtener documento",
                `Ocurrio un error al acceder a tus documentos en la base de datos, porfavor intenta de nuevo mas tarde.`
            );
            reject(err);
        });
        resolve(docSnap.data());
    });
};
/* ---------------------------------------------------------------- */

/* Funcion para eliminar todo el contenido del anio tanto de la interfaz como del arreglo en el almacenamiento local y la base de datos */
const deleteYear = async () => {
    //Se quitan los eventos del modal
    modalCnt.style.pointerEvents = "none";

    for (let io of global.iosArr) {
        //Para cada io del anio
        document.getElementById(io.id).remove(); //Se elimina el elemento de la interfaz
        if (global.userLoged && io.files.length > 0) await deleteFilesFromStorage(io); //Se eliminan los archivos de la base de datos
    }
    global.setIosArr([]);
    for (let month of global.months) ioFuncs.calcMonthBalance(month); //Se vuelve a calcular el balance de todos los meses
    //Una vez el arreglo este vacio
    dbFuncs.saveIoArrOnLS(); //Se guarda el arreglo en el almacenamiento local
    //Si la sesion esta iniciada
    if (global.userLoged) {
        //Si el anio que se esta eliminando no es el actual
        if (global.yearToLoad !== new Date().getFullYear().toString()) {
            //Se elimina el documento del anio de la base de datos
            await FIREBASE.firestoreFuncs
                .deleteDoc(FIREBASE.firestoreFuncs.doc(FIREBASE.FBDB, global.userLoged.uid, global.yearToLoad))
                .catch(() => {
                    modal.shwModal(
                        "Error al eliminar documento",
                        "Ocurrio un error al eliminar el documento de la base de datos, intenta de nuevo más tarde."
                    );
                });
            open("tablero.html", "_self"); //Se abre la pagina del tablero que muestra todos los anios
        } else {
            //Si el anio que se esta eliminando es el actual
            saveOnFb(global.iosArr, global.yearToLoad); //Se guarda el arreglo vacio en la base de datos
        }
    }
    modalCnt.style.pointerEvents = "all";
    modal.modalCnt.classList.add("d-none"); //Se oculta el modal que mostro el mensaje de confirmacion
};
/* ------------------------------------------------------------------------------------------------------------------------------------ */

export {
    mergeArrWithLSArr,
    deleteFileFromStorage,
    deleteFilesFromStorage,
    getSrcFilesFromStorage,
    saveIoFilesOnStorage,
    saveOnFb,
    getDataFromFb,
    deleteYear,
};
