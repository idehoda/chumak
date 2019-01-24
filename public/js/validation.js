var check = {
    phone: false
};

$(document).ready((e) => {
    const submitButton = document.querySelector('#send-button');
    const phone = document.getElementById('input-3');

    phone.addEventListener( 'input', validatePhone);
    phone.addEventListener( 'focusout', validatePhone);
    submitButton.addEventListener('click', submit);
})

function submit(e){
    const password = document.getElementById("input-5"),
        confirm_password = document.getElementById("input-6");
    if(password.value != confirm_password.value) {
        alert("Passwords Don't Match");
        e.preventDefault();
    } else if (!check.phone){
        alert("Phone number is not correct");
        e.preventDefault();
    }
}
function validatePhone({ target: {value} }){
    var regexp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})$/;
      if(value.match(regexp)) {
        this.nextSibling.children[0].classList.remove('red');
        check.phone = true;
      } else {
        this.nextSibling.children[0].classList.add('red');
        check.phone = false;
      }
}