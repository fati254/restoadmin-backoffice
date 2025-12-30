document.getElementById("loginform").addEventListener( "submit" , function(e){
 e.preventDefault();
const user = document.getElementById("username").value;
const code = document.getElementById("password").value;

if( user === "admin" && code === "1234" ){
    window.location.href="menu.html";
}
else{
    document.getElementById("error").textContent="Identifiants Incorrects";
}
} );


