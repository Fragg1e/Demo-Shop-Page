const form = document.getElementById("register-form");
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

form.addEventListener("submit", (e) => {
    let errors = [];
    if(firstname_input){
        errors = GetRegisterFormErrors(firstname_input.value, address_line_1_input.value, address_line_2_input.value, address_line_3_input.value, eircode_input.value, email_input.value, password_input.value, repeat_password_input.value);
        
    }
    else{
        errors = GetLoginFormErrors(email_input.value, password_input.value);
    }
    if(errors.length > 0){
        e.preventDefault();
        errorBox.innerText = errors.join(". ")
    }
    
})


function GetRegisterFormErrors(firstname, lastname, address_line_1, address_line_2, address_line_3, eircode, email, password, repeat_password){
    let errors = [];
    console.log(password, repeat_password);

    if(password != repeat_password){
        password_input.parentElement.classList.add("incorrect");
        repeat_password_input.parentElement.classList.add("incorrect");
        errors.push("Passwords do not match!");

    }
    return errors;
}

const allInputs = [firstname_input, lastname_input, address_line_1_input, address_line_2_input, address_line_3_input, eircode_input, email_input, password_input, repeat_password_input];


allInputs.forEach(input => {
    input.addEventListener('input', () =>{
        if(input.parentElement.classList.contains("incorrect")){
            input.parentElement.classList.remove("incorrect")
            errorBox.innerHTML = "";
        }
    })
})

