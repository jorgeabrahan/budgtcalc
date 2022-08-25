import * as FIREBASE from "./imports/firebase.mjs";
import * as theme from "./modules/theme.mjs";

theme.selectInptTheme(theme.prevTheme); //Se selecciona el tema correspondiente en el input
theme.setTheme(theme.prevTheme); //Se establece el tema seleccionado al cargar

const frmRegister = document.getElementById("frmRegister");
const frmRegisterMsg = document.getElementById("frmRegisterMsg");
/* Arreglo con los errores del formulario */
const frmRegisterErrs = [
    {
        input: "mail",
        valid: false,
        err: "El correo no tiene el formato correcto: ejemplo@correo.com",
    },
    {
        input: "password",
        valid: false,
        err: "La contraseña tiene menos de 8 caracteres.",
    },
    {
        input: "confPassword",
        valid: false,
        err: "Las contraseñas no coinciden.",
    },
];
/* -------------------------------------- */

/* Se obtienen todos los mensajes de error */
const getErr = (errInput) => frmRegisterErrs.find((err) => err.input === errInput);
const errMail = getErr("mail");
const errPass = getErr("password");
const errConfPass = getErr("confPassword");
/* --------------------------------------- */

/* Funcion para mostrar mensaje de error del formulario */
const shwFrmRegisterMsg = () => {
    for (let error of frmRegisterErrs) {
        if (!error.valid) {
            //Al primer error que se encuentre
            frmRegisterMsg.textContent = error.err; //Se muestra el error
            return;
        }
    }
    //De lo contrario se muestra el mensaje por defecto
    frmRegisterMsg.textContent = "";
};
/* ---------------------------------------------------- */

/* Evento para verificar el input de correo */
frmRegister.inptEmail.addEventListener("input", () => {
    errMail.valid = false;
    const regexMailValidation =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //Expresion regular para validar el correo
    if (regexMailValidation.test(frmRegister.inptEmail.value.toLowerCase())) errMail.valid = true; //Si el correo tiene el formato correcto
    shwFrmRegisterMsg();
});
/* ---------------------------------------- */

/* Evento para verificar el input de clave */
frmRegister.inptPass.addEventListener("input", () => {
    errPass.valid = false;
    if (frmRegister.inptPass.value.length > 8) errPass.valid = true;
    shwFrmRegisterMsg();
});
/* --------------------------------------- */

/* Evento para verificar la confirmacion de la clave */
frmRegister.inptPassConfirm.addEventListener("input", () => {
    errConfPass.valid = false;
    if (frmRegister.inptPassConfirm.value === frmRegister.inptPass.value) errConfPass.valid = true;
    shwFrmRegisterMsg();
});
/* ------------------------------------------------- */

const modalPaymentMsg = document.getElementById("modalPaymentMsg");

//Se obtiene el modal para mostrar los metodos de pago
const modalCnt = document.getElementById("modalCnt");
/* Al dar click en registrarse */
frmRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    //Para cada input del formulario de registro
    for (let input of frmRegister.elements) {
        if (input.type == "submit") continue; //Si el input es el boton
        //Para cualquier otro input
        if (input.value !== "") continue; //Si no esta vacio entonces se pasa con el siguiente
        //De lo contrario
        frmRegisterMsg.textContent = "Debes llenar todos los campos antes de continuar.";
        return;
    }
    /* Para cada error de los errores de los inputs */
    for (let error of frmRegisterErrs) {
        if (!error.valid) return; //Si alguno de los inputs no se lleno correctamente no se registra
    }
    modalPaymentMsg.textContent = "";
    modalCnt.classList.remove("d-none");
});
/* --------------------------- */

/* Funciones y codigo relacionado con botones paypal */
paypal
    .Buttons({
        style: {
            layout: "vertical",
            color: "blue",
            label: "paypal",
        },

        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: 4.99,
                        },
                    },
                ],
            });
        },

        onApprove: function (data, actions) {
            actions.order.capture().then(function (details) {
                //Si el estado de la orden no es completado
                if (details.status !== "COMPLETED") return;
                //Por otro lado si ya se realizo el pago se registra la cuenta del usuario
                FIREBASE.authFuncs
                    .createUserWithEmailAndPassword(FIREBASE.FBAUTH, frmRegister.inptEmail.value, frmRegister.inptPass.value)
                    .then(() => {
                        window.location.href = "/public/index.html";
                    })
                    .catch((err) => {
                        //Si se da un error se muestra un mensaje dandole la opcion al usuario de enviar un correo con el error que se ha presentado al intentar registrar la cuenta
                        modalPaymentMsg.innerHTML = `Ocurrio un error al registrar tu cuenta. Reporta este error al siguiente correo <a href="mailto:jorge24abrahan@gmail.com?subject=Error%20al%20registrar%20cuenta%20en%20aplicacion%20de%20calculo%20de%20presupuesto&body=El%20error%20al%20registrar%20la%20cuenta%20fue:%20${err}">jorge24abrahan@gmail.com</a>`;
                    });
            });
        },

        onCancel: function () {
            modalPaymentMsg.textContent = "Has cancelado la transaccion y por tanto no se registro el correo.";
        },

        onError: function (err) {
            modalPaymentMsg.textContent = "Ocurrio un error al concretar el pago: " + err;
        },
    })
    .render("#paypal-buttons");
/* ------------------------------------------------- */
