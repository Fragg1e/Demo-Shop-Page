const register_form = document.getElementById("register-form");
const login_form = document.getElementById("login-form");

const firstname_input = document.getElementById("firstname-input");
const lastname_input = document.getElementById("lastname-input");
const address_line_1_input = document.getElementById("address-line-1-input");
const address_line_2_input = document.getElementById("address-line-2-input");
const address_line_3_input = document.getElementById("address-line-3-input");
const eircode_input = document.getElementById("eircode-input");
const email_input = document.getElementById("email-input");
const password_input = document.getElementById("password-input");
const repeat_password_input = document.getElementById("repeat-password-input");
const errorBox = document.getElementById("error-box")


function GetUsers(){
    return JSON.parse(localStorage.getItem("users") || "[]");

}
function AddUser(user) {
    const users = GetUsers();
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}

if(register_form){
    register_form.addEventListener("submit", (e) => {
    
    const errors = GetRegisterFormErrors(firstname_input.value, lastname_input.value, address_line_1_input.value, address_line_2_input.value, address_line_3_input.value, eircode_input.value, email_input.value, password_input.value, repeat_password_input.value); 

    if(errors.length > 0){
        e.preventDefault();
        errorBox.innerText = errors.join(". ")
    }
    else{
        AddUser(SaveData());
        RegisterUser();
    }
    
})
}

if(login_form){
    login_form.addEventListener("submit", (e) => {
    
    const errors = GetLoginFormErrors(email_input.value, password_input.value);    
    if(errors.length > 0){
        e.preventDefault();
        errorBox.innerText = errors.join(". ")
        return;
    }
    else{
        LoginUser();
    }

 
})
}


function GetLoginFormErrors(email, password){
    let errors = [];
    const users = GetUsers();
    const match = users.find((users) => users.email === email && users.password === password);

    if(!match){
        password_input.parentElement.classList.add("incorrect");
        errors.push("Incorrect password or email!");
    }
    
    return errors;
}

function GetRegisterFormErrors(firstname, lastname, address_line_1, address_line_2, address_line_3, eircode, email, password, repeat_password){
    let errors = [];
    const users = GetUsers();

    if(password != repeat_password){
        password_input.parentElement.classList.add("incorrect");
        repeat_password_input.parentElement.classList.add("incorrect");
        errors.push("Passwords do not match!");

    }
    if(users.find((users) => users.email === email)){
        email_input.parentElement.classList.add("incorrect");
        errors.push("Account exists with that email already, try logging in.");
    }
    
    
    return errors;
}

const allInputs = [firstname_input, lastname_input, address_line_1_input, address_line_2_input, address_line_3_input, eircode_input, email_input, password_input, repeat_password_input].filter(input => input != null);


allInputs.forEach(input => {
    input.addEventListener('input', () =>{
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect")
            errorBox.innerHTML = "";
        }
    })
})

function SaveData(login = false){
    
    if(login){
       const fullUser = GetUsers().find(u => u.email === email && u.password === password);
       

        const user = {
        firstname :fullUser.firstname,
        lastname: fullUser.lastname,
        address:{
            line1: fullUser.address_line_1,
            line2: fullUser.address_line_2,
            line3: fullUser.address_line_3,
            eircode: fullUser.eircode
            },
        email: fullUser.email,
        password: fullUser.password,
    }
    return user;
    }
    
    const user = {
        firstname :firstname_input.value,
        lastname: lastname_input.value,
        address:{
            line1: address_line_1_input.value,
            line2: address_line_2_input.value,
            line3: address_line_3_input.value,
            eircode: eircode_input.value
            },
        email: email_input.value,
        password: password_input.value,
    }
    return user;
}


async function RegisterUser() {
    const res = await fetch("/register", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(SaveData())
    });
    const data = await res.json();
}

async function LoginUser() {


    const res = await fetch("/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(SaveData(true))
    });
    const data = await res.json();
    }


console.log(GetUsers());