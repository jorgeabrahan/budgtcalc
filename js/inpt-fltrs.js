const inptFltrByMnth = document.getElementById('inptFltrByMnth');
inptFltrByMnth.firstElementChild.setAttribute('selected', '');
inptFltrByMnth.addEventListener('change', () => {
    for (let month of cntMonths.children) {
        if (inptFltrByMnth.value === 'todos') {
            month.classList.remove('d-none');
            month.removeAttribute('open', '');
        }
        else if (inptFltrByMnth.value === 'actual') {
            if (month.id !== actMnthName.toLowerCase()) {
                month.classList.add('d-none');
                month.removeAttribute('open', '');
            }
            if (month.id === actMnthName.toLowerCase()) {
                month.classList.remove('d-none');
                month.setAttribute('open', '');
            }
        } else {
            if (inptFltrByMnth.value !== month.id) {
                month.classList.add('d-none');
                month.removeAttribute('open', '');
            }
            if (inptFltrByMnth.value === month.id) {
                month.classList.remove('d-none');
                month.setAttribute('open', '');
            }
        }
    }
});

const searchOnInouts = (inoutsFrmDb) => {
    const bodyStyles = getComputedStyle(document.body);
    const query = formsearch.inptFltrSrch.value;
    const mnthsWithRes = [];
    for (let inout of inoutsFrmDb) {
        const inoutHtmlElmnt = document.getElementById(`${inout.key}`);
        const inoutHtmlMnth = document.querySelector(`.${inout.month}`).parentElement;
        if (inout.id.toLowerCase().includes(query.toLowerCase()) || inout.description.toLowerCase().includes(query.toLowerCase())) {
            inoutHtmlElmnt.style.display = 'block';
            inoutHtmlElmnt.style.borderColor = bodyStyles.getPropertyValue('--main-col');
            if (query === '') inoutHtmlElmnt.style.borderColor = bodyStyles.getPropertyValue('--brdr-inputs');
            mnthsWithRes.push(inout.month);
            inoutHtmlMnth.setAttribute('open', '');
        } else {
            inoutHtmlElmnt.style.borderColor = bodyStyles.getPropertyValue('--brdr-inputs');
            if (!mnthsWithRes.find(mnth => mnth === inout.month)) inoutHtmlMnth.removeAttribute('open', '');
        }
    }
}

const formsearch = document.getElementById('formsearch');
formsearch.addEventListener('submit', e => {
    e.preventDefault();
    readInoutObjStr(searchOnInouts);
});