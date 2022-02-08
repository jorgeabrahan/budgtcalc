# calculo-presupuesto
Herramienta de calculo de presupuesto elaborada con vanilla JS y haciendo uso de la API IndexedDB.

La herramienta de calculo de presupuesto fue elaborada enteramente con vanilla JS. Incorpora dos paletas de colores junto con la opcion de alternar entre ellas para un modo claro y oscuro.
El objetivo de esta herramienta es ayudar al usuario a mantener un orden en sus finanzas y un absoluto y completo control sobre sus egresos e ingresos. Mantener por escrito todos los gastos ayuda a ser mas conscientes de la cantidad de dinero que gastamos en cosas que son totalmente innecesarias.
A fin de lograr el objetivo planteado la herramienta le otorga al usuario la capacidad de ingresar, eliminar y editar montos correspondientes a ingresos o egresos. Cada ingreso o egreso cuenta con un titulo, descripcion, monto y fecha exacta (dia, mes y año), de esta forma el usuario recordara con mucha mas facilidad el acontecimiento.
A fin de mantener las finanzas ordenadas se utiliza un esquema anual; la herramienta permite agregar montos en cualquiera de los 12 meses del año y cuando carga, muestra abierto el mes correspondiente a la fecha actual.
En cada mes se muestra un balance financiero que incluye el total de ingresos, total de egresos y tambien el presupuesto mensual; y en la parte superior se muestra un balance financiero del año, donde incluye el total de ingresos, egresos y el presupuesto de todos los meses, asi como tambien el porcentaje que han representado los egresos con respecto a los ingresos en lo que va del año.
A fin de encontrar mas rapido algun monto concreto, la herramienta le otorga al usuario dos filtradores: uno para los meses y otro para realizar una busqueda. El filtrador de los meses por defecto muestra todos los meses, pero podemos filtrar por el mes actual o por un mes en concreto de cualquiera de los 12. El buscador recorre todos los montos que ha ingresado el usuario y busca una coincidencia o bien en el titulo o bien en la descripcion del monto; al encontrar alguna similitud remarcara con un borde el monto correspondiente a la busqueda realizada.
En la parte superior de la pagina encontramos un boton con el titulo de "nuevo presupuesto" que permite al usuario eliminar todos los montos que ha ingresado en el año, ya sea porque desea empezar de 0 o bien cuando el año termina.
Al terminar el año, el formulario para agregar montos se deshabilitara y la unica forma de activarlo de nuevo es eliminando los montos realizados para empezar de 0 con el nuevo balance anual.

Como toda la información es almacenada en el dispositivo del usuario mediante la API IndexedDB, esta sujeta a la sesion. Esto quiere decir que si se cambia de navegador o de dispositivo no se tendra acceso a la misma información.
La razón por la que se utiliza IndexedDB es para brindarle al usuario la seguridad de que sus datos no estan siendo recolectados y mucho menos manipulados o utilizados con algún fin, todo lo que se ingresa en el sitio web queda en el dispositivo del mismo.
