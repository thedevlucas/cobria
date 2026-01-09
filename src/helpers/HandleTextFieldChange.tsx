// Only numbers in textfields
// Regex
const numberRegex = /^[0-9]+$/; 
export const HandleNumberChange = (setter: (value: string) => void) => (
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if ((numberRegex.test(newValue) || newValue === "")) {
        setter(newValue); 
      }
    }
);
export const handlePasswordChange = (setter: (value: string) => void) => (
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if ((numberRegex.test(newValue) || newValue === "") && newValue.length <= 4) {
      setter(newValue); 
    }
  }
);
// Only numbers in textfield + decimal
// Regex
const decimalRegex = /^[0-9]+(\.)*([0-9])*$/;
export const HandleDecimalChange = (setter: (value: string) => void) => (
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (decimalRegex.test(newValue) || newValue === "") {
        setter(newValue); 
      }
    }
);
// Only words in textfield
// Regex
const wordRegex = /^[a-zA-Z\s]+$/;
export const HandleWordChange = (setter: (value: string) => void) => (
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (wordRegex.test(newValue) || newValue === "") {
        setter(newValue); 
      }
    }
);