// Tu URL de Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyY2avo8Y55W28Fxpjy2UZBb_SwIRBcbiGzS5uV0SLEX0VArFaLYblt9gkYP2mqF0h2/exec";

// Función para alternar entre Login y Registro
function toggleForm(tipo) {
    const loginForm = document.getElementById('loginForm');
    const registroForm = document.getElementById('registroForm');
    const titulo = document.getElementById('titulo');
    const mensaje = document.getElementById('mensaje');

    mensaje.innerText = ""; 
    
    if (tipo === 'registro') {
        loginForm.classList.add('hidden');
        registroForm.classList.remove('hidden');
        titulo.innerText = "Crear Cuenta";
    } else {
        registroForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        titulo.innerText = "Iniciar Sesión";
    }
}

// Función universal para enviar datos al servidor
async function enviarPeticion(payload) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.style.color = "blue";
    mensajeDiv.innerText = "Procesando...";

    try {
        const respuesta = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();

        if (data.success) {
            mensajeDiv.style.color = "green";
            mensajeDiv.innerText = data.message;
            return data;
        } else {
            mensajeDiv.style.color = "red";
            mensajeDiv.innerText = "Error: " + data.message;
            return null;
        }
    } catch (error) {
        mensajeDiv.style.color = "red";
        mensajeDiv.innerText = "Error de conexión con el servidor.";
        console.error("Error:", error);
        return null;
    }
}

// Función de Registro con validaciones (RECUPERADA)
async function registrarUsuario() {
    const user = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value;
    const passConfirm = document.getElementById('regPassConfirm').value;
    const token = document.getElementById('regToken').value.trim();

    // Validaciones básicas
    if (!user || !pass || !passConfirm || !token) {
        alert("Todos los campos son obligatorios.");
        return;
    }
    if (pass !== passConfirm) {
        alert("Las contraseñas no coinciden.");
        return;
    }
    if (pass[0] === '0') {
        alert("Por seguridad, la contraseña no puede iniciar con cero.");
        return;
    }
    if (pass.length < 5 || pass.length > 10) {
        alert("La contraseña debe tener entre 5 y 10 caracteres.");
        return;
    }

    const payload = { action: 'register', username: user, password: pass, token: token };
    const resultado = await enviarPeticion(payload);

    if (resultado) {
        // Limpiar formulario y volver al login tras éxito
        document.getElementById('regUser').value = "";
        document.getElementById('regPass').value = "";
        document.getElementById('regPassConfirm').value = "";
        document.getElementById('regToken').value = "";
        setTimeout(() => toggleForm('login'), 2000);
    }
}

// Función de Inicio de Sesión
async function iniciarSesion() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;

    if (!user || !pass) {
        alert("Ingresa tu usuario y contraseña.");
        return;
    }

    const payload = { action: 'login', username: user, password: pass };
    const resultado = await enviarPeticion(payload);

    if (resultado) {
        localStorage.clear();

        // Normalizamos el rol a mayúsculas para que la seguridad de las otras páginas no falle
        const rolLimpio = resultado.rol ? resultado.rol.toString().toUpperCase().trim() : 'USER';

        localStorage.setItem('sesionActiva', 'true');
        localStorage.setItem('userId', resultado.id);
        localStorage.setItem('usuario', resultado.username);
        localStorage.setItem('rol', rolLimpio);

        // Sin importar el rol, todos pasan primero por la ruleta
        setTimeout(() => {
            window.location.href = "ruleta.html";
        }, 1000);
    }
}