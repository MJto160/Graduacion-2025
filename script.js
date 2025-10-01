// === CONTROL DE MÚSICA CON SOUNDCLOUD - REPRODUCCIÓN AUTOMÁTICA ===
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('musicBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (!btn) return;
    
    let isPlaying = false;
    let widget;
    
    // Inicializar widget de SoundCloud
    const iframe = document.getElementById('backgroundMusic');
    if (iframe) {
        widget = SC.Widget(iframe);
        
        widget.bind(SC.Widget.Events.READY, function() {
            console.log("Reproductor de SoundCloud listo - Iniciando música...");
            
            // REPRODUCIR AUTOMÁTICAMENTE AL CARGAR
            widget.play();
        });
        
        widget.bind(SC.Widget.Events.PLAY, function() {
            isPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            btn.classList.add('playing');
            console.log("Música reproduciéndose");
        });
        
        widget.bind(SC.Widget.Events.PAUSE, function() {
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            btn.classList.remove('playing');
            console.log("Música pausada");
        });
        
        widget.bind(SC.Widget.Events.ERROR, function(error) {
            console.error("Error en SoundCloud:", error);
        });
    }
    
    // Controlar música - SOLO PARA PAUSAR/REANUDAR
    btn.addEventListener('click', function() {
        if (!widget) {
            alert("El reproductor no está disponible");
            return;
        }
        
        if (isPlaying) {
            widget.pause();
        } else {
            widget.play();
        }
    });
    
    // Intentar reproducir después de interacción del usuario (para navegadores estrictos)
    document.addEventListener('click', function iniciarMusica() {
        if (widget && !isPlaying) {
            widget.play();
        }
        document.removeEventListener('click', iniciarMusica);
    });
});

// === ENVIAR FOTO POR WHATSAPP DESDE EL BOTÓN EXISTENTE ===
document.getElementById('photoUpload').addEventListener('click', function(e) {
    e.preventDefault(); // Evita que se abra el selector de archivos

    const userName = "Invitado";
    const mensaje = encodeURIComponent(`Hola, soy ${userName} y quiero compartir una foto de la graduación 🎉`);
    const numero = '50249867089';

    // Abrir WhatsApp
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    alert('TU IMAGEN HA SIDO ENVIADA POR WHATZAPP!!📲');
});

// ===== FUNCIONALIDAD DE CÁMARA MEJORADA =====
let stream = null;
let capturedImageData = null;
let currentFacingMode = 'environment'; // Por defecto cámara trasera

const cameraModal = document.getElementById('cameraModal');
const openCamera = document.getElementById('openCamera');
const closeCamera = document.getElementById('closeCamera');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');

// Botón para cambiar cámara
const switchCameraBtn = document.createElement('button');
switchCameraBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Cambiar Cámara';
switchCameraBtn.className = 'camera-btn';
switchCameraBtn.style.display = 'none';
document.querySelector('.camera-controls').appendChild(switchCameraBtn);

function resetCameraUI() {
    capturedImage.style.display = 'none';
    video.style.display = 'block';
    startCameraBtn.style.display = 'flex';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'none';
    savePhotoBtn.style.display = 'none';
    switchCameraBtn.style.display = 'none';
    captureBtn.disabled = true;

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

async function startCamera() {
    try {
        const constraints = {
            video: { 
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        startCameraBtn.style.display = 'none';
        captureBtn.style.display = 'flex';
        switchCameraBtn.style.display = 'flex';
        captureBtn.disabled = false;
        
        // Verificar si hay múltiples cámaras disponibles
        checkAvailableCameras();
        
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Revisa los permisos de tu navegador.');
    }
}

// Función para verificar cámaras disponibles
async function checkAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Si solo hay una cámara, ocultar el botón de cambiar
        if (videoDevices.length <= 1) {
            switchCameraBtn.style.display = 'none';
        } else {
            switchCameraBtn.style.display = 'flex';
        }
    } catch (error) {
        console.log('No se pudieron enumerar los dispositivos:', error);
    }
}

// Función para cambiar entre cámaras
async function switchCamera() {
    if (!stream) return;
    
    // Detener stream actual
    stream.getTracks().forEach(track => track.stop());
    
    // Cambiar modo de cámara
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    try {
        const constraints = {
            video: { 
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
    } catch (error) {
        console.error('Error al cambiar cámara:', error);
        alert('No se pudo cambiar la cámara. Intentando con la cámara por defecto...');
        
        // Intentar con cualquier cámara disponible
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (fallbackError) {
            alert('No se pudo acceder a ninguna cámara.');
        }
    }
}

function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Si es la cámara frontal, espejar la imagen
    if (currentFacingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Restaurar transformación
    if (currentFacingMode === 'user') {
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    capturedImageData = canvas.toDataURL('image/png');
    capturedImage.src = capturedImageData;
    capturedImage.style.display = 'block';
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    switchCameraBtn.style.display = 'none';
    retakeBtn.style.display = 'flex';
    savePhotoBtn.style.display = 'flex';
}

function retakePhoto() {
    capturedImage.style.display = 'none';
    video.style.display = 'block';
    captureBtn.style.display = 'flex';
    switchCameraBtn.style.display = 'flex';
    retakeBtn.style.display = 'none';
    savePhotoBtn.style.display = 'none';
}

// Guardar foto → Enviar por WhatsApp
async function savePhoto() {
    if (capturedImageData) {
        savePhotoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando...';
        savePhotoBtn.disabled = true;

        try {
            const mensaje = encodeURIComponent(`¡Hola! Te envío una foto tomada en la graduación 🎉`);
            const numero = '50249867089';
            const whatsappUrl = `https://wa.me/${numero}?text=${mensaje}`;
            
            window.open(whatsappUrl, '_blank');
            alert("Ahora adjunta la foto en el chat de WhatsApp 📲");

            cameraModal.classList.remove('open');
            resetCameraUI();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            savePhotoBtn.innerHTML = '<i class="fas fa-save"></i> Enviar Foto';
            savePhotoBtn.disabled = false;
        }
    }
}

// Eventos cámara - ACTUALIZADOS
openCamera.addEventListener('click', function() {
    cameraModal.classList.add('open');
    resetCameraUI();
});

closeCamera.addEventListener('click', function() {
    cameraModal.classList.remove('open');
    resetCameraUI();
});

startCameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', retakePhoto);
savePhotoBtn.addEventListener('click', savePhoto);
switchCameraBtn.addEventListener('click', switchCamera); // NUEVO EVENTO

window.addEventListener('click', function(e) {
    if (e.target === cameraModal) {
        cameraModal.classList.remove('open');
        resetCameraUI();
    }
});

// ===== FUNCIONALIDAD DE MODAL "TIPS Y NOTAS" =====
const tipsModal = document.getElementById('tipsModal');
const showTipsBtn = document.getElementById('showTips');
const closeTipsBtn = document.getElementById('closeTips');

// Abrir modal de tips
showTipsBtn.addEventListener('click', function() {
    tipsModal.classList.add('open');
});

// Cerrar modal con el botón "X"
closeTipsBtn.addEventListener('click', function() {
    tipsModal.classList.remove('open');
});

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener('click', function(e) {
    if (e.target === tipsModal) {
        tipsModal.classList.remove('open');
    }
});

// ===== CONFIRMACIÓN POR WHATSAPP =====

// Botones y modal
const openConfirmationBtn = document.getElementById("openConfirmation");
const confirmationModal = document.getElementById("confirmationModal");
const closeModalBtn = document.getElementById("closeModal");

// Abrir modal
openConfirmationBtn.addEventListener("click", () => {
    confirmationModal.classList.add("open");
});

// Cerrar modal
closeModalBtn.addEventListener("click", () => {
    confirmationModal.classList.remove("open");
});

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener("click", function(e) {
    if (e.target === confirmationModal) {
        confirmationModal.classList.remove("open");
    }
});

// Formulario
const confirmationForm = document.getElementById("confirmationForm");

confirmationForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const comentarios = document.getElementById("comentarios").value;

    const numero = "50249867089"; //
    const mensaje = `🎉 Confirmación de asistencia 🎉

👤 Nombre: ${nombre}
📝 Comentarios: ${comentarios}`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    alert("¡Gracias por confirmar! Tu respuesta fue enviada por WhatsApp.");

    // Cierra el modal
    confirmationModal.classList.remove("open");
});

// Función mejorada para "¿Cómo llegar?" con navegación desde ubicación actual
function configurarNavegacion(botonId, destinoNombre, destinoLat, destinoLng, enlaceRespaldo) {
    document.getElementById(botonId).addEventListener('click', function() {
        if (navigator.geolocation) {
            // Mostrar mensaje de carga
            const botonOriginal = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';
            this.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    // Restaurar botón
                    document.getElementById(botonId).innerHTML = botonOriginal;
                    document.getElementById(botonId).disabled = false;
                    
                    const usuarioLat = position.coords.latitude;
                    const usuarioLng = position.coords.longitude;
                    
                    // URL para navegación paso a paso
                    const mapsUrl = `https://www.google.com/maps/dir/${usuarioLat},${usuarioLng}/${destinoLat},${destinoLng}`;
                    
                    window.open(mapsUrl, '_blank');
                },
                function(error) {
                    // Restaurar botón
                    document.getElementById(botonId).innerHTML = botonOriginal;
                    document.getElementById(botonId).disabled = false;
                    
                    let mensajeError = 'No pudimos obtener tu ubicación. ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            mensajeError += 'Permiso de ubicación denegado.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            mensajeError += 'Ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            mensajeError += 'Tiempo de espera agotado.';
                            break;
                        default:
                            mensajeError += 'Error desconocido.';
                    }
                    
                    // Ofrecer opciones alternativas
                    if (confirm(mensajeError + '\n\n¿Quieres ver la ubicación del ' + destinoNombre + '?')) {
                        // Usar enlace de respaldo o coordenadas
                        if (enlaceRespaldo) {
                            window.open(enlaceRespaldo, '_blank');
                        } else {
                            window.open(`https://www.google.com/maps?q=${destinoLat},${destinoLng}`, '_blank');
                        }
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        } else {
            alert('Tu navegador no soporta geolocalización. Mostrando ubicación del ' + destinoNombre + '...');
            // Usar enlace de respaldo o coordenadas
            if (enlaceRespaldo) {
                window.open(enlaceRespaldo, '_blank');
            } else {
                window.open(`https://www.google.com/maps?q=${destinoLat},${destinoLng}`, '_blank');
            }
        }
    });
}

// Configurar navegación para la CEREMONIA (Iglesia) - NUEVAS COORDENADAS EXACTAS
configurarNavegacion(
    'locationCeremony', 
    'Iglesia', 
    14.554060695608998, 
    -90.73028210196246,
    'https://www.google.com/maps?q=14.52190494207514,-90.73022193110863'
);

// Configurar navegación para la CELEBRACIÓN (Salón de eventos) - NUEVAS COORDENADAS
configurarNavegacion(
    'locationCelebration',   
    'Salón de eventos', 
    14.52190494207514,
    -90.73022193110863,
    'https://www.google.com/maps?q=14.52190494207514,-90.73022193110863'
);

// Agregar esta función al final de tu script.js
function initScrollArrows() {
    const arrows = document.querySelectorAll('.scroll-down-arrow');
    
    arrows.forEach((arrow, index) => {
        arrow.addEventListener('click', () => {
            const nextSection = document.getElementById(`section${index + 2}`);
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Llamar la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initScrollArrows();
    // ... el resto de tu código existente
});


// === GUARDAR EN CALENDARIO DEL TELÉFONO ===
document.getElementById('saveCalendar').addEventListener('click', function() {
    // Detalles del evento de graduación
    const evento = {
        titulo: '🎓 Graduación de David Tomás',
        descripcion: 'Ceremonia de graduación de David Tomás - ¡Celebremos este logro importante!',
        ubicacion: 'Salón de eventos Exclu, La Antigua Guatemala',
        inicio: '2024-11-08T16:30:00', // Ajusta la fecha según necesites
        fin: '2024-11-08T22:00:00',
        allday: false
    };

    // Crear URLs para diferentes sistemas
    const urls = {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.titulo)}&dates=20241108T163000/20241108T220000&details=${encodeURIComponent(evento.descripcion)}&location=${encodeURIComponent(evento.ubicacion)}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(evento.titulo)}&body=${encodeURIComponent(evento.descripcion)}&location=${encodeURIComponent(evento.ubicacion)}&startdt=2024-11-08T16:30:00&enddt=2024-11-08T22:00:00`,
        ics: generarArchivoICS(evento)
    };

    // Detectar dispositivo y ofrecer opciones
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Es un dispositivo móvil
        mostrarOpcionesMovil(urls, evento);
    } else {
        // Es una computadora
        mostrarOpcionesDesktop(urls, evento);
    }
});

// Función para generar archivo ICS (compatible con todos los calendarios)
function generarArchivoICS(evento) {
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${evento.titulo}`,
        `DESCRIPTION:${evento.descripcion}`,
        `LOCATION:${evento.ubicacion}`,
        'DTSTART:20241108T163000',
        'DTEND:20241108T220000',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
}

// Mostrar opciones para móviles
function mostrarOpcionesMovil(urls, evento) {
    const opciones = `
        <div style="text-align: center; padding: 20px;">
            <h3 class="gold-text">📅 Guardar en Calendario</h3>
            <p class="white-text">Selecciona tu aplicación de calendario:</p>
            <button onclick="window.open('${urls.google}', '_blank')" class="save-btn" style="margin: 10px; width: 200px;">
                📱 Google Calendar
            </button>
            <button onclick="window.open('${urls.outlook}', '_blank')" class="save-btn" style="margin: 10px; width: 200px;">
                📧 Outlook Calendar
            </button>
            <button onclick="descargarICS('${urls.ics}', 'graduacion-david-tomas.ics')" class="save-btn" style="margin: 10px; width: 200px;">
                ⬇️ Descargar .ICS
            </button>
        </div>
    `;

    // Crear modal temporal
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${opciones}
        </div>
    `;
    document.body.appendChild(modal);
}

// Mostrar opciones para desktop
function mostrarOpcionesDesktop(urls, evento) {
    const opciones = `
        <div style="text-align: center; padding: 20px;">
            <h3 class="gold-text">📅 Guardar en Calendario</h3>
            <p class="white-text">Elige cómo quieres guardar el evento:</p>
            <button onclick="window.open('${urls.google}', '_blank')" class="save-btn" style="margin: 10px; width: 200px;">
                🌐 Google Calendar
            </button>
            <button onclick="window.open('${urls.outlook}', '_blank')" class="save-btn" style="margin: 10px; width: 200px;">
                📧 Outlook Calendar
            </button>
            <button onclick="descargarICS('${urls.ics}', 'graduacion-david-tomas.ics')" class="save-btn" style="margin: 10px; width: 200px;">
                ⬇️ Descargar .ICS
            </button>
            <p style="font-size: 0.9rem; margin-top: 15px; color: #d4af37;">
                💡 El archivo .ICS funciona con Apple Calendar, Outlook y otras apps
            </p>
        </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${opciones}
        </div>
    `;
    document.body.appendChild(modal);
}

// Función para descargar archivo ICS
function descargarICS(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cerrar el modal después de descargar
    const modal = document.querySelector('.modal.open');
    if (modal) modal.remove();
    
    alert('✅ Evento descargado. Ábrelo con tu aplicación de calendario favorita.');
}

// CONTADOR REGRESIVO MEJORADO - VERSIÓN SIMPLIFICADA
function updateCountdown() {
    // Fiesta: 8 de Noviembre 2024, 4:30 PM
    const graduationDate = new Date("2025-11-08T18:30:00-06:00").getTime();
    const now = new Date().getTime();
    const distance = graduationDate - now;

    // Si ya pasó la fecha, mostrar ceros
    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    // Cálculos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar DOM
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Inicialización del contador - SE EJECUTA INMEDIATAMENTE
console.log("🕒 Contador regresivo iniciado");
updateCountdown(); // Ejecutar inmediatamente
setInterval(updateCountdown, 1000); // Actualizar cada segundo
