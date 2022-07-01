const prevTheme = localStorage.getItem('Theme') || 'dark'; //Tema de la app

/* Establecer el tema de la app */
const inptTheme = document.getElementById('inptTheme');

const selectInptTheme = theme => {
    /* Select correct theme from attribute */
    for (let opt of inptTheme.options) {
        if (opt.value !== theme) {
            opt.removeAttribute('selected', 'selected');
            continue;
        }
        opt.setAttribute('selected', 'selected');
    }
    /* ----------------------------------- */
}
const setTheme = theme => {
    const isDark = theme == 'dark' ? true : false;
    localStorage.setItem('Theme', theme);
    if (isDark) {
        document.body.classList.add('dark');
        return;
    }
    document.body.classList.remove('dark');
}

inptTheme.onchange = () => { setTheme(inptTheme.value) };
/* ----------------------------- */

export { prevTheme, setTheme, selectInptTheme };