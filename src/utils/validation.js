export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  export const validateName = (name) => {
    return name.trim().length >= 2;
  };