import { Validator } from "../validator";

// starting with words, digital, underscore and dashes (+$ one or more)
export let USERNAME_REGEX = /^[\w\d_-]+$/;

export function validateLogin(username) {
  // validates, manages erros and push right choices
  const validator = new Validator();

  if (username.length >= 20)
    validator.error("Username must be fewer than 20 characters");

  if (!USERNAME_REGEX.test(username))
    validator.error("Only allowed numbers, digits, underscores and dashes");


  return validator;
}
