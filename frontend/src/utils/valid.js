export const valid = (email, password) => {
    if (!email || !password) {
      return "Please enter all the required fields";
    }
    if (!validateEmail(email)) return "Invalid email";
    if (password.length < 8) return "Password must have at least 8 character";
  };
  
  export const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  