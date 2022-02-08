const btnNewBudg = document.getElementById('btnNewBudg');
const deleteAllInoutcomes = () => {
    const allHtmlInoutcomes = document.querySelectorAll('.inoutcome');
    allHtmlInoutcomes.forEach(inoutcome => {
        delInoutcomeObj(inoutcome);
    })
    modalCnt.classList.add('d-none');
}
btnNewBudg.addEventListener('click', () => {
    shwModal('Nuevo presupuesto', 'Al dar clic en \'eliminar todo\' se borraran todos los ingresos y egresos que has agregado ¿Estas seguro de querer eliminar todo?', deleteAllInoutcomes, 'Eliminar todo');
});

const btnInfo = document.getElementById('btnInfo');
btnInfo.addEventListener('click', () => {
    shwModal('Información general', 'La herramienta cálculo de presupuesto permite mantener un balance financiero exacto de todos los ingresos y egresos por un año.<br>La información se almacena enteramente en el dispositivo del usuario para mantener los datos privados y seguros.<br>Sin embargo, como la información esta ligada a la sesión en este navegador y dispositivo concreto, la información ingresada aquí no sera visible en ningun otro dispositivo o navegador.<br><br>¡Espero y esta herramienta te sea de gran utilidad para manejar tus finanzas!');
});

