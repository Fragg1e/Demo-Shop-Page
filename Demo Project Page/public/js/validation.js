const register_form = document.getElementById("register-form");
const login_form = document.getElementById("login-form");
const card_form = document.getElementById("card-form");

const firstname_input = document.getElementById("firstname-input");
const lastname_input = document.getElementById("lastname-input");
const address_line_1_input = document.getElementById("address-line-1-input");
const address_line_2_input = document.getElementById("address-line-2-input");
const address_line_3_input = document.getElementById("address-line-3-input");
const eircode_input = document.getElementById("eircode-input");
const email_input = document.getElementById("email-input");
const password_input = document.getElementById("password-input");
const repeat_password_input = document.getElementById("repeat-password-input");

const card_name_input = document.getElementById("card-name-input");
const card_number_input = document.getElementById("card-number-input");
const card_expiry_input = document.getElementById("card-expiry-input");
const card_code_input = document.getElementById("card-code-input");


const errorBox = document.getElementById("error-box")




if(register_form){
    register_form.addEventListener("submit", (form) => {
    
    const errors = GetRegisterFormErrors(firstname_input.value, lastname_input.value, address_line_1_input.value, address_line_2_input.value, address_line_3_input.value, eircode_input.value, email_input.value, password_input.value, repeat_password_input.value); 

    if(errors.length > 0){
        form.preventDefault();
        errorBox.innerText = errors.join(". ")
    }
    else{
        AddUser(SaveData());
        RegisterUser();
    }
    
})
}

if(login_form){
    login_form.addEventListener("submit", (form) => {
    
    const errors = GetLoginFormErrors(email_input.value, password_input.value);    
    if(errors.length > 0){
        form.preventDefault();
        errorBox.innerText = errors.join(". ")
        return;
    }
    else{
        LoginUser();
    }
})
}


if(card_form){
    card_form.addEventListener("submit", (form) => {
    
    const errors = GetCardFormErrors(card_name_input.value, card_number_input.value, card_expiry_input.value, card_code_input.value);    
    if(errors.length > 0){
        form.preventDefault();
        errorBox.innerText = errors.join(" ")
        return;
    } 
    else{
        SavePaymentDetails();
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

function GetCardFormErrors(name, number, expiry, code){
    let errors = [];

    if(number.length != 16){
        card_number_input.parentElement.classList.add("incorrect");
        errors.push("Invalid Card Number!");
    }
    if(code.length != 3){
        card_code_input.parentElement.classList.add("incorrect");
        errors.push("Invalid Security Number!");
    }
    
    const month = Number(expiry.slice(0, 2));
    const year = Number(expiry.slice(3, 5));

    console.log(month, year)

    if(expiry[2] != "/"){
        card_expiry_input.parentElement.classList.add("incorrect");
        errors.push("Invalid Expiry Date - Missing '/'!");
    }
    if(year < 25 ){
        card_expiry_input.parentElement.classList.add("incorrect");
        errors.push("Invalid Expiry Date - Card is Expired!");
    }
    if(year == 25){
        if(month <= 11){
            card_expiry_input.parentElement.classList.add("incorrect");
            errors.push("Card is Expired!");
        }
    }
    if(month > 12 || month < 1){
        card_expiry_input.parentElement.classList.add("incorrect");
        errors.push("Invalid Expiry Date - Not a valid month!");
    }

    return errors;
}

const allInputs = [firstname_input, lastname_input, address_line_1_input, address_line_2_input, address_line_3_input, eircode_input, email_input, password_input, repeat_password_input, card_name_input, card_number_input, card_expiry_input, card_code_input].filter(input => input != null);


allInputs.forEach(input => {
    input.addEventListener('input', () =>{
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect")
            errorBox.innerHTML = "";
        }
    })
})

function GetUsers(){
    return JSON.parse(localStorage.getItem("users") || "[]");
    

}
function AddUser(user) {
    const users = GetUsers();
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}

function SaveData(){
    
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

async function SendUsersToServer() {
    let users = GetUsers();
    const response = await fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({users})
  });

  const result = await response.json();
  console.log("Server response:", result);
}


async function RegisterUser() {
    SendUsersToServer();
    const res = await fetch("/register", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(SaveData())
    });
    const result = await res.json();
    console.log("Server response:", result);
}

async function LoginUser() {

    const res = await fetch("/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email_input.value,
            })    
    });
    const data = await res.json();
}

async function SavePaymentDetails() {
    const paymentDetails = {
        name: card_name_input.value,
        number: card_number_input.value,
        expiry: card_expiry_input.value,
        code: card_code_input.value
    }
    const res = await fetch("/paymentDetails", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentDetails)
    });
    const result = await res.json();
    console.log("Server response:", result);
}

addEventListener("DOMContentLoaded", (event) => 
    { 
        SendUsersToServer();
    })

console.log(GetUsers());