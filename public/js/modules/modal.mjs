/* Funcion para mostrar un modal con un boton opcional */
const modalCnt = document.getElementById('modalCnt');
const modalInfo = document.getElementById('modalInfo');
const modalBtn = (btnTxt) => `<button class="form__button form__button--modal">${btnTxt}</button>`;
function shwModal(title, description, func, btnTxt) {
    modalInfo.innerHTML = `
        <h2 class="modal__title">${title}</h2>
        <p class="modal__description">${description}</p>
        ${arguments.length === 4 ? modalBtn(btnTxt) : ''}
    `;
    //Solo si el boton existe
    if (arguments.length === 4) {
        modalInfo.querySelector('button').addEventListener('click', () => { //Se escucha el evento de click en el boton del modal
            func(); //Se ejecuta la funcion callback
        })
    }
    modalCnt.classList.remove('d-none');
}
/* --------------------------------------------------- */

export { modalCnt, shwModal };