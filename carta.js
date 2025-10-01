document.addEventListener('DOMContentLoaded', function() {
    const btnAbrir = document.querySelector("#Abrir");
    const contenedorCarta = document.querySelector("#AbrirContenedor");
    
    function abrirCarta() {
        const ElementoSuperior = document.querySelector(".superior");
        ElementoSuperior.classList.add("abrir-superior");
        
        const IconoCorazon = document.querySelector(".bx");
        IconoCorazon.classList.add("bx-rotada");
        
        setTimeout(() => {
            ElementoSuperior.style.zIndex = -1;
            const ElementoMensaje = document.querySelector(".mensaje");
            ElementoMensaje.classList.add("abrir-mensaje");
            
            // Redirigir a otra página después de 2 segundos
            setTimeout(() => {
                window.location.href = "invitacion.html";
            }, 8000);
        }, 700);
    }
    
    btnAbrir.addEventListener("click", abrirCarta);
    contenedorCarta.addEventListener("click", abrirCarta);
});