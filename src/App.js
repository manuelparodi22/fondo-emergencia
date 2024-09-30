import React, { useState, useEffect } from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

function App() {
  const [inputs, setInputs] = useState({
    incomeInPesos: '', // User's salary in pesos
    months: '', // Number of months for the emergency fund
    dollarType: 'oficial' // Default dollar type
  });

  const [dollarRates, setDollarRates] = useState({
    blue: { venta: 0 },
    oficial: { venta: 0 },
    mep: { venta: 0 }
  });

  const [results, setResults] = useState({
    emergencyFundInDollars: '',
    convertedIncome: ''
  });

  const [calculated, setCalculated] = useState(false);

  // Fetch dollar rates
  useEffect(() => {
    Promise.all([
      fetch("https://dolarapi.com/v1/dolares/blue"),
      fetch("https://dolarapi.com/v1/dolares/oficial"),
      fetch("https://dolarapi.com/v1/dolares/bolsa")
    ])
      .then(responses => Promise.all(responses.map(response => response.json())))
      .then(data => {
        setDollarRates({
          blue: data[0],
          oficial: data[1],
          mep: data[2]
        });
      })
      .catch(error => console.log('Error al obtener los datos:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });

    // Recalculate if already calculated and changing dollar type
    if (calculated && name === 'dollarType') {
      calculateResults({ ...inputs, [name]: value });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      calculateResults(inputs); // Llama a la función de cálculo cuando se presiona Enter
    }
  };

  const calculateResults = (overrideInputs = null) => {
    const currentInputs = overrideInputs || inputs;

    // Validar que los campos no estén vacíos
    if (!currentInputs.incomeInPesos || !currentInputs.months) {
      return;
    }

    const incomeInPesos = parseFloat(currentInputs.incomeInPesos);
    const months = parseFloat(currentInputs.months);

    let selectedDollarRate = 0;
    if (currentInputs.dollarType === 'blue') {
      selectedDollarRate = dollarRates.blue.venta;
    } else if (currentInputs.dollarType === 'oficial') {
      selectedDollarRate = dollarRates.oficial.venta;
    } else if (currentInputs.dollarType === 'mep') {
      selectedDollarRate = dollarRates.mep.venta;
    }

    // Evitar dividir por 0 en caso de que la cotización no se haya cargado
    if (selectedDollarRate === 0 || isNaN(incomeInPesos) || isNaN(months)) {
      return;
    }

    const convertedIncome = incomeInPesos / selectedDollarRate;
    const emergencyFundInDollars = convertedIncome * months;

    setResults({
      emergencyFundInDollars: emergencyFundInDollars.toFixed(2),
      convertedIncome: convertedIncome.toFixed(2)
    });

    setCalculated(true);
  };

  const handleCalculateClick = () => {
    calculateResults(inputs); // Usar los inputs actuales
  };

  const refreshInputs = () => {
    setInputs({
      incomeInPesos: '',
      months: '',
      dollarType: 'oficial'
    });
    setResults({
      emergencyFundInDollars: '',
      convertedIncome: ''
    });
    setCalculated(false);
  };

  const isCalculateDisabled = !inputs.incomeInPesos || !inputs.months;

  return (
    <div className="App">
      {/* Card for Inputs */}
      <Card className="input-card" style={{ width: '90%', maxWidth: '400px', margin: '0 auto', marginBottom: '20px' }}>
        <CardHeader 
          title="Calculá tu Fondo de Emergencia" 
          subheader="Ingresá tu ingreso mensual en pesos y la cantidad de meses." 
        />
        <CardContent>
          <Box className="input-section" sx={{ padding: '15px' }}>
            <TextField
              name="incomeInPesos"
              value={inputs.incomeInPesos}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress} // Detecta la tecla Enter
              label="Ingreso mensual en Pesos"
              variant="outlined"
              fullWidth
              sx={{ marginBottom: '15px' }}
            />
            <TextField
              name="months"
              value={inputs.months}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress} // Detecta la tecla Enter
              label="Cantidad de meses"
              variant="outlined"
              fullWidth
              sx={{ marginBottom: '15px' }}
            />
            <Select
              name="dollarType"
              value={inputs.dollarType}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress} // Detecta la tecla Enter
              fullWidth
            >
              <MenuItem value="oficial">Dólar Oficial (Venta: {dollarRates.oficial.venta})</MenuItem>
              <MenuItem value="blue">Dólar Blue (Venta: {dollarRates.blue.venta})</MenuItem>
              <MenuItem value="mep">Dólar MEP (Venta: {dollarRates.mep.venta})</MenuItem>
            </Select>
          </Box>
        </CardContent>

        <CardActions sx={{ marginTop: '20px', marginBottom: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button 
              onClick={handleCalculateClick} // Usar la nueva función para calcular
              variant="contained" 
              disabled={isCalculateDisabled}
              sx={{ backgroundColor: '#229c8aff', color: '#ffffff' }} 
            >
              Calcular
            </Button>
            <Button 
              onClick={refreshInputs} 
              variant="outlined" 
              sx={{ color: '#f38384ff', borderColor: '#f38384ff', marginLeft: '10px' }} 
            >
              Borrar
            </Button>
          </Box>
        </CardActions>
      </Card>

      {/* Card for Results */}
      <Card className="result-card" style={{ width: '90%', maxWidth: '400px', margin: '0 auto' }}>
        <CardHeader title="Resultados" />
        <CardContent>
          <Box className="result-section">
            <Typography>Ingreso mensual en {inputs.dollarType === 'oficial' ? 'Dólar Oficial' : inputs.dollarType === 'blue' ? 'Dólar Blue' : 'Dólar MEP'}: ${results.convertedIncome}</Typography>
            <Typography>Fondo de Emergencia en {inputs.dollarType === 'oficial' ? 'Dólar Oficial' : inputs.dollarType === 'blue' ? 'Dólar Blue' : 'Dólar MEP'}: ${results.emergencyFundInDollars}</Typography>

            <Box sx={{ marginTop: '20px' }}>
              {calculated && (
                <Typography color="info.main">
                  Necesitás ahorrar ${results.emergencyFundInDollars} para tener un fondo de emergencia de {inputs.months} meses.
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
