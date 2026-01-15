// LOGIN - Authentification simple avec redirection vers dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Clear existing session to allow re-login
    localStorage.removeItem("user");

    const loginForm = document.getElementById("loginform");
    
    if (!loginForm) return;
    
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const user = document.getElementById("username").value;
        const code = document.getElementById("password").value;
        const errorElement = document.getElementById("error");

        if (user === "admin" && code === "1234") {
            // Sauvegarder l'utilisateur dans localStorage
            localStorage.setItem("user", JSON.stringify({ username: user, loggedIn: true }));
            
            // Rediriger vers le dashboard
            if (window.location.pathname.includes('/pages/')) {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "pages/dashboard.html";
            }
        } else {
            if (errorElement) {
                // Utiliser traductions si disponibles
                const errorMsg = (typeof t === 'function') ? t('invalidCredentials') : "Identifiants Incorrects";
                errorElement.textContent = errorMsg;
            }
        }
    });
    
    // Initialiser le sélecteur de langue
    const langSelect = document.getElementById('langSelect');
    if (langSelect && typeof getCurrentLanguage === 'function') {
        langSelect.value = getCurrentLanguage();
        langSelect.addEventListener('change', function(e) {
            if (typeof setLanguage === 'function') {
                setLanguage(e.target.value);
            }
        });
    }
    
    // Réappliquer les traductions si disponibles
    setTimeout(function() {
        if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
            applyLanguage(getCurrentLanguage());
        }
    }, 100);
});


