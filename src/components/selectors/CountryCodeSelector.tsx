import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import {
  countries,
  CountryType,
  defaultCountryCode,
} from "../../constants/Constants";

interface CountryCodeSelectorProps {
  handleCountryChange: (value: CountryType | null) => void;
}

const CountryCodeSelector = ({
  handleCountryChange,
}: CountryCodeSelectorProps) => {
  return (
    <Autocomplete
      id="country-select-demo"
      sx={{ width: 300 }}
      options={countries}
      autoHighlight
      onChange={(_event, value) => handleCountryChange(value)}
      defaultValue={defaultCountryCode}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      renderOption={(props, option) => {
        const optionProps = props;
        return (
          <Box
            key={option.code}
            component="li"
            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...optionProps}
          >
            {/* <img
              loading="lazy"
              width="20"
              src={`https://flagcdn.com/16x12/${option.code.toLowerCase()}.png`}
              alt=""
            /> */}
            {option.label} ({option.code}) +{option.phone}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Pais"
          InputProps={{
            ...params.InputProps,
            autoComplete: "new-password", // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

export default CountryCodeSelector;
