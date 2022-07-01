import * as global from './global.mjs';
import * as fbImports from './fb-imports.mjs';
import * as dbFuncs from './db-funcs.mjs';

/* Funcion para unificar el arreglo en la base de datos con el que esta en el almacenamiento local */
const mergeArrWithLSArr = arrFromFb => {
    const mergedArrs = [...global.iosArr];
    for (let io of arrFromFb) {
        const exists = dbFuncs.getIoIndxFromArr(io.id) == -1 ? false : true;  
        if (!exists) { //Si no existe el io en el array del ls
            mergedArrs.push(io);
        }
    }
    return mergedArrs;
}
/* ----------------------------------------------------------------------------------------------- */

/* Funcion para eliminar archivo del storage */
const deleteFilesFromStorage = async (io) => {
    for (let file of io.files) {
        const refToDelete = fbImports.ref(fbImports.fbStorage, `/images/${global.userLoged.uid}/${global.yearToLoad}/${io.id}/${file.name}`);
        await fbImports.deleteObject(refToDelete).catch(() => {
            global.shwModal('Error al eliminar archivo', `Se dio un error al eliminar el archivo ${file.name} de la base de datos, intente de nuevo mas tarde.`);
        })
    }
}
/* ----------------------------------------- */

/* Funcion para obtener el enlace de las imagenes en el storage */
const getSrcFilesFromStorage = (io) => {
    const listRef = fbImports.ref(fbImports.fbStorage, `/images/${global.userLoged.uid}/${global.yearToLoad}/${io.id}`);
    fbImports.listAll(listRef).then((res) => {
        res.items.forEach(async (doc, indx, arr) => {
            await fbImports.getDownloadURL(doc).then(src => {
                const nameArr = doc.name.split('.');
                const fileExt = nameArr[nameArr.length - 1];
                io.files.push({
                    name: doc.name,
                    fileExt,
                    src
                });
                //Cuando ya se hayan obtenido todos los archivos del storage
                if (io.files.length === arr.length) {
                    global.iosArr.push(io); //Se guarda el io en el arreglo
                    dbFuncs.newIo(io); //Se crea el io en la interfaz
                }
            }).catch(() => {
                global.shwModal('Error al obtener archivo', `El archivo ${doc.name} se almaceno correctamente en la base de datos pero ocurrio un problema al tratar de acceder a el.`);
                return;
            })
        });
    }).catch(() => {
        global.shwModal('Error al obtener archivos', `Los archivos se almacenaron correctamente en la base de datos pero ocurrio un error al intentar obtenerlos.`);
    });
}
/* ------------------------------------------------------------ */

/* Funcion para subir los archivos del io al storage */
const saveIoFilesOnStorage = (ioId, files) => {
    return new Promise(async (resolve, reject) => {
        for (let file of files) {
            const storageRef = fbImports.ref(fbImports.fbStorage, `/images/${global.userLoged.uid}/${global.yearToLoad}/${ioId}/${file.name}`); //Referencia para almacenar los files en el storage
            await fbImports.uploadBytes(storageRef, file, { contentType: file.type }).catch(err => { //Se suben al storage en la referencia indicada los archivos del io
                global.shwModal('Error al subir archivo', `Ocurrio un error al subir el archivo ${file.name} a la base de datos. Por favor intentalo de nuevo mas tarde.`);
                reject(err);
            });
        }
        resolve(); //Se resuelve la promesa despues de subir los archivos al storage
    })
}
/* ------------------------------------------------- */

const saveOnFb = (arrToSave, yearToSave) => {
    fbImports.setDoc(fbImports.doc(fbImports.fbDB, global.userLoged.uid, yearToSave), { data: [...arrToSave] }).catch(() => {
        global.shwModal('Error al subir monto', `Ocurrio un error al subir el monto que acabas de ingresar a la base de datos, porfavor intenta de nuevo mas tarde.`);
    })
}

/* Se obtiene la informacion para el año actual de la base de datos */
const getDataFromFb = (uid, year) => {
    return new Promise(async (resolve, reject) => {
        const docRef = fbImports.doc(fbImports.fbDB, uid, year); //Se accede a una coleccion que tiene como nombre el uid y al documento del año actual
        const docSnap = await fbImports.getDoc(docRef).catch(err => {
            global.shwModal('Error al obtener documento', `Ocurrio un error al acceder a tus documentos en la base de datos, porfavor intenta de nuevo mas tarde.`);
            reject(err);
        });
        resolve(docSnap.data());
    });
}
/* ---------------------------------------------------------------- */

export { mergeArrWithLSArr, deleteFilesFromStorage, getSrcFilesFromStorage, saveIoFilesOnStorage, saveOnFb, getDataFromFb };