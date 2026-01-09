import {
  TextField,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

interface TimeDaySelectorProps {
  fromTime: string;
  toTime: string;
  selectedDays: number[];
  setFromTime: (time: string) => void;
  setToTime: (time: string) => void;
  setSelectedDays: (days: number[]) => void;
}
const TimeDaySelector = ({
  fromTime,
  toTime,
  selectedDays,
  setFromTime,
  setToTime,
  setSelectedDays,
}: TimeDaySelectorProps) => {
  const handleDayToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: number[]
  ) => {
    setSelectedDays([...newDays].sort((a, b) => a - b));
  };

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      {/* Time Inputs */}
      <Grid item>
        <TextField
          label="Desde"
          type="time"
          value={fromTime}
          onChange={(e) => setFromTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
        />
      </Grid>
      <Grid item>
        <TextField
          label="Hasta"
          type="time"
          value={toTime}
          onChange={(e) => setToTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
        />
      </Grid>

      {/* Day Selector */}
      <Grid item xs={9}>
        <ToggleButtonGroup
          value={selectedDays}
          onChange={handleDayToggle}
          aria-label="days-selector"
          exclusive={false}
        >
          {[
            { label: "DOM", value: 0 },
            { label: "LUN", value: 1 },
            { label: "MAR", value: 2 },
            { label: "MIE", value: 3 },
            { label: "JUE", value: 4 },
            { label: "VIE", value: 5 },
            { label: "SAB", value: 6 },
          ].map((day) => (
            <ToggleButton
              key={day.value}
              value={day.value}
              aria-label={day.label}
            >
              {day.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
};

export default TimeDaySelector;
