// Enhanced Create Phone Dialog - Senior Developer Implementation
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode"; 
import { API_URL } from '../../constants/Constants';

// Enhanced Create Phone Interface
interface DebtorInfo {
  id: number;
  name: string;
  document: number;
  email?: string;
  status: string;
}

interface PhoneFormData {
  debtorId?: number;
  debtorName: string;
  document: string;
  phoneNumber: string;
  countryCode: string;
  phoneType: 'cellphone' | 'telephone';
  notes?: string;
}

interface EnhancedCreatePhoneProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (phoneData: any) => void;
}

interface TokenPayload {
    id: number;
}

const EnhancedCreatePhone: React.FC<EnhancedCreatePhoneProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debtors, setDebtors] = useState<DebtorInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorInfo | null>(null);
  const [formData, setFormData] = useState<PhoneFormData>({
    debtorName: '',
    document: '',
    phoneNumber: '',
    countryCode: '593', // Ecuador default
    phoneType: 'cellphone',
    notes: ''
  });

  // Complete list of country codes for international support (no duplicates)
  const countryCodes = [
    { code: '593', name: 'Ecuador', flag: '🇪🇨', format: '9-10 dígitos' },
    { code: '58', name: 'Venezuela', flag: '🇻🇪', format: '10-11 dígitos' },
    { code: '57', name: 'Colombia', flag: '🇨🇴', format: '10-11 dígitos' },
    { code: '51', name: 'Perú', flag: '🇵🇪', format: '9-10 dígitos' },
    { code: '54', name: 'Argentina', flag: '🇦🇷', format: '10-11 dígitos' },
    { code: '56', name: 'Chile', flag: '🇨🇱', format: '9-10 dígitos' },
    { code: '55', name: 'Brasil', flag: '🇧🇷', format: '10-11 dígitos' },
    { code: '52', name: 'México', flag: '🇲🇽', format: '10-11 dígitos' },
    { code: '1', name: 'USA/Canadá', flag: '🇺🇸', format: '10 dígitos' },
    { code: '44', name: 'Reino Unido', flag: '🇬🇧', format: '10-11 dígitos' },
    { code: '49', name: 'Alemania', flag: '🇩🇪', format: '10-12 dígitos' },
    { code: '33', name: 'Francia', flag: '🇫🇷', format: '9-10 dígitos' },
    { code: '39', name: 'Italia', flag: '🇮🇹', format: '9-11 dígitos' },
    { code: '34', name: 'España', flag: '🇪🇸', format: '9-10 dígitos' },
    { code: '31', name: 'Países Bajos', flag: '🇳🇱', format: '9-10 dígitos' },
    { code: '46', name: 'Suecia', flag: '🇸🇪', format: '9-10 dígitos' },
    { code: '47', name: 'Noruega', flag: '🇳🇴', format: '8-10 dígitos' },
    { code: '45', name: 'Dinamarca', flag: '🇩🇰', format: '8-10 dígitos' },
    { code: '41', name: 'Suiza', flag: '🇨🇭', format: '9-10 dígitos' },
    { code: '43', name: 'Austria', flag: '🇦🇹', format: '9-11 dígitos' },
    { code: '351', name: 'Portugal', flag: '🇵🇹', format: '9-10 dígitos' },
    { code: '7', name: 'Rusia', flag: '🇷🇺', format: '10-11 dígitos' },
    { code: '86', name: 'China', flag: '🇨🇳', format: '11 dígitos' },
    { code: '81', name: 'Japón', flag: '🇯🇵', format: '10-11 dígitos' },
    { code: '82', name: 'Corea del Sur', flag: '🇰🇷', format: '10-11 dígitos' },
    { code: '91', name: 'India', flag: '🇮🇳', format: '10 dígitos' },
    { code: '61', name: 'Australia', flag: '🇦🇺', format: '9-10 dígitos' },
    { code: '64', name: 'Nueva Zelanda', flag: '🇳🇿', format: '8-10 dígitos' },
    { code: '27', name: 'Sudáfrica', flag: '🇿🇦', format: '9-10 dígitos' },
    { code: '20', name: 'Egipto', flag: '🇪🇬', format: '9-10 dígitos' },
    { code: '234', name: 'Nigeria', flag: '🇳🇬', format: '10-11 dígitos' },
    { code: '254', name: 'Kenia', flag: '🇰🇪', format: '9-10 dígitos' },
    { code: '212', name: 'Marruecos', flag: '🇲🇦', format: '9-10 dígitos' },
    { code: '213', name: 'Argelia', flag: '🇩🇿', format: '9-10 dígitos' },
    { code: '216', name: 'Túnez', flag: '🇹🇳', format: '8-10 dígitos' },
    { code: '218', name: 'Libia', flag: '🇱🇾', format: '9-10 dígitos' },
    { code: '220', name: 'Gambia', flag: '🇬🇲', format: '7-8 dígitos' },
    { code: '221', name: 'Senegal', flag: '🇸🇳', format: '9 dígitos' },
    { code: '222', name: 'Mauritania', flag: '🇲🇷', format: '8 dígitos' },
    { code: '223', name: 'Mali', flag: '🇲🇱', format: '8 dígitos' },
    { code: '224', name: 'Guinea', flag: '🇬🇳', format: '8-9 dígitos' },
    { code: '225', name: 'Costa de Marfil', flag: '🇨🇮', format: '8-10 dígitos' },
    { code: '226', name: 'Burkina Faso', flag: '🇧🇫', format: '8 dígitos' },
    { code: '227', name: 'Níger', flag: '🇳🇪', format: '8 dígitos' },
    { code: '228', name: 'Togo', flag: '🇹🇬', format: '8 dígitos' },
    { code: '229', name: 'Benín', flag: '🇧🇯', format: '8 dígitos' },
    { code: '230', name: 'Mauricio', flag: '🇲🇺', format: '7-8 dígitos' },
    { code: '231', name: 'Liberia', flag: '🇱🇷', format: '7-8 dígitos' },
    { code: '232', name: 'Sierra Leona', flag: '🇸🇱', format: '8 dígitos' },
    { code: '233', name: 'Ghana', flag: '🇬🇭', format: '9 dígitos' },
    { code: '235', name: 'Chad', flag: '🇹🇩', format: '8 dígitos' },
    { code: '236', name: 'República Centroafricana', flag: '🇨🇫', format: '8 dígitos' },
    { code: '237', name: 'Camerún', flag: '🇨🇲', format: '9 dígitos' },
    { code: '238', name: 'Cabo Verde', flag: '🇨🇻', format: '7 dígitos' },
    { code: '239', name: 'Santo Tomé y Príncipe', flag: '🇸🇹', format: '7 dígitos' },
    { code: '240', name: 'Guinea Ecuatorial', flag: '🇬🇶', format: '9 dígitos' },
    { code: '241', name: 'Gabón', flag: '🇬🇦', format: '8 dígitos' },
    { code: '242', name: 'República del Congo', flag: '🇨🇬', format: '9 dígitos' },
    { code: '243', name: 'República Democrática del Congo', flag: '🇨🇩', format: '9 dígitos' },
    { code: '244', name: 'Angola', flag: '🇦🇴', format: '9 dígitos' },
    { code: '245', name: 'Guinea-Bisáu', flag: '🇬🇼', format: '7 dígitos' },
    { code: '246', name: 'Territorio Británico del Océano Índico', flag: '🇮🇴', format: '7 dígitos' },
    { code: '247', name: 'Ascensión', flag: '🇦🇨', format: '7 dígitos' },
    { code: '248', name: 'Seychelles', flag: '🇸🇨', format: '7 dígitos' },
    { code: '249', name: 'Sudán', flag: '🇸🇩', format: '9 dígitos' },
    { code: '250', name: 'Ruanda', flag: '🇷🇼', format: '9 dígitos' },
    { code: '251', name: 'Etiopía', flag: '🇪🇹', format: '9 dígitos' },
    { code: '252', name: 'Somalia', flag: '🇸🇴', format: '8-9 dígitos' },
    { code: '253', name: 'Yibuti', flag: '🇩🇯', format: '8 dígitos' },
    { code: '255', name: 'Tanzania', flag: '🇹🇿', format: '9 dígitos' },
    { code: '256', name: 'Uganda', flag: '🇺🇬', format: '9 dígitos' },
    { code: '257', name: 'Burundi', flag: '🇧🇮', format: '8 dígitos' },
    { code: '258', name: 'Mozambique', flag: '🇲🇿', format: '9 dígitos' },
    { code: '260', name: 'Zambia', flag: '🇿🇲', format: '9 dígitos' },
    { code: '261', name: 'Madagascar', flag: '🇲🇬', format: '9 dígitos' },
    { code: '262', name: 'Reunión', flag: '🇷🇪', format: '9 dígitos' },
    { code: '263', name: 'Zimbabue', flag: '🇿🇼', format: '9 dígitos' },
    { code: '264', name: 'Namibia', flag: '🇳🇦', format: '9 dígitos' },
    { code: '265', name: 'Malaui', flag: '🇲🇼', format: '9 dígitos' },
    { code: '266', name: 'Lesoto', flag: '🇱🇸', format: '8 dígitos' },
    { code: '267', name: 'Botsuana', flag: '🇧🇼', format: '8 dígitos' },
    { code: '268', name: 'Suazilandia', flag: '🇸🇿', format: '8 dígitos' },
    { code: '269', name: 'Comoras', flag: '🇰🇲', format: '7 dígitos' },
    { code: '290', name: 'Santa Elena', flag: '🇸🇭', format: '4 dígitos' },
    { code: '291', name: 'Eritrea', flag: '🇪🇷', format: '7 dígitos' },
    { code: '297', name: 'Aruba', flag: '🇦🇼', format: '7 dígitos' },
    { code: '298', name: 'Islas Feroe', flag: '🇫🇴', format: '6 dígitos' },
    { code: '299', name: 'Groenlandia', flag: '🇬🇱', format: '6 dígitos' },
    { code: '350', name: 'Gibraltar', flag: '🇬🇮', format: '8 dígitos' },
    { code: '352', name: 'Luxemburgo', flag: '🇱🇺', format: '9 dígitos' },
    { code: '353', name: 'Irlanda', flag: '🇮🇪', format: '9 dígitos' },
    { code: '354', name: 'Islandia', flag: '🇮🇸', format: '7-9 dígitos' },
    { code: '355', name: 'Albania', flag: '🇦🇱', format: '8-9 dígitos' },
    { code: '356', name: 'Malta', flag: '🇲🇹', format: '8 dígitos' },
    { code: '357', name: 'Chipre', flag: '🇨🇾', format: '8 dígitos' },
    { code: '358', name: 'Finlandia', flag: '🇫🇮', format: '9-10 dígitos' },
    { code: '359', name: 'Bulgaria', flag: '🇧🇬', format: '8-9 dígitos' },
    { code: '370', name: 'Lituania', flag: '🇱🇹', format: '8 dígitos' },
    { code: '371', name: 'Letonia', flag: '🇱🇻', format: '8 dígitos' },
    { code: '372', name: 'Estonia', flag: '🇪🇪', format: '7-8 dígitos' },
    { code: '373', name: 'Moldavia', flag: '🇲🇩', format: '8 dígitos' },
    { code: '374', name: 'Armenia', flag: '🇦🇲', format: '8 dígitos' },
    { code: '375', name: 'Bielorrusia', flag: '🇧🇾', format: '9 dígitos' },
    { code: '376', name: 'Andorra', flag: '🇦🇩', format: '6 dígitos' },
    { code: '377', name: 'Mónaco', flag: '🇲🇨', format: '8-9 dígitos' },
    { code: '378', name: 'San Marino', flag: '🇸🇲', format: '6-10 dígitos' },
    { code: '380', name: 'Ucrania', flag: '🇺🇦', format: '9 dígitos' },
    { code: '381', name: 'Serbia', flag: '🇷🇸', format: '8-9 dígitos' },
    { code: '382', name: 'Montenegro', flag: '🇲🇪', format: '8 dígitos' },
    { code: '383', name: 'Kosovo', flag: '🇽🇰', format: '8-9 dígitos' },
    { code: '385', name: 'Croacia', flag: '🇭🇷', format: '8-9 dígitos' },
    { code: '386', name: 'Eslovenia', flag: '🇸🇮', format: '8-9 dígitos' },
    { code: '387', name: 'Bosnia y Herzegovina', flag: '🇧🇦', format: '8-9 dígitos' },
    { code: '389', name: 'Macedonia del Norte', flag: '🇲🇰', format: '8-9 dígitos' },
    { code: '420', name: 'República Checa', flag: '🇨🇿', format: '9 dígitos' },
    { code: '421', name: 'Eslovaquia', flag: '🇸🇰', format: '9 dígitos' },
    { code: '423', name: 'Liechtenstein', flag: '🇱🇮', format: '7 dígitos' },
    { code: '500', name: 'Islas Malvinas', flag: '🇫🇰', format: '5 dígitos' },
    { code: '501', name: 'Belice', flag: '🇧🇿', format: '7 dígitos' },
    { code: '502', name: 'Guatemala', flag: '🇬🇹', format: '8 dígitos' },
    { code: '503', name: 'El Salvador', flag: '🇸🇻', format: '8 dígitos' },
    { code: '504', name: 'Honduras', flag: '🇭🇳', format: '8 dígitos' },
    { code: '505', name: 'Nicaragua', flag: '🇳🇮', format: '8 dígitos' },
    { code: '506', name: 'Costa Rica', flag: '🇨🇷', format: '8 dígitos' },
    { code: '507', name: 'Panamá', flag: '🇵🇦', format: '8 dígitos' },
    { code: '508', name: 'San Pedro y Miquelón', flag: '🇵🇲', format: '6 dígitos' },
    { code: '509', name: 'Haití', flag: '🇭🇹', format: '8 dígitos' },
    { code: '590', name: 'Guadalupe', flag: '🇬🇵', format: '9 dígitos' },
    { code: '591', name: 'Bolivia', flag: '🇧🇴', format: '8 dígitos' },
    { code: '592', name: 'Guyana', flag: '🇬🇾', format: '7 dígitos' },
    { code: '594', name: 'Guayana Francesa', flag: '🇬🇫', format: '9 dígitos' },
    { code: '595', name: 'Paraguay', flag: '🇵🇾', format: '9 dígitos' },
    { code: '596', name: 'Martinica', flag: '🇲🇶', format: '9 dígitos' },
    { code: '597', name: 'Surinam', flag: '🇸🇷', format: '7 dígitos' },
    { code: '598', name: 'Uruguay', flag: '🇺🇾', format: '8-9 dígitos' },
    { code: '599', name: 'Antillas Neerlandesas', flag: '🇧🇶', format: '7 dígitos' },
    { code: '670', name: 'Timor Oriental', flag: '🇹🇱', format: '8 dígitos' },
    { code: '672', name: 'Isla Norfolk', flag: '🇳🇫', format: '5 dígitos' },
    { code: '673', name: 'Brunéi', flag: '🇧🇳', format: '7 dígitos' },
    { code: '674', name: 'Nauru', flag: '🇳🇷', format: '7 dígitos' },
    { code: '675', name: 'Papúa Nueva Guinea', flag: '🇵🇬', format: '8 dígitos' },
    { code: '676', name: 'Tonga', flag: '🇹🇴', format: '7 dígitos' },
    { code: '677', name: 'Islas Salomón', flag: '🇸🇧', format: '7 dígitos' },
    { code: '678', name: 'Vanuatu', flag: '🇻🇺', format: '7 dígitos' },
    { code: '679', name: 'Fiyi', flag: '🇫🇯', format: '7 dígitos' },
    { code: '680', name: 'Palau', flag: '🇵🇼', format: '7 dígitos' },
    { code: '681', name: 'Wallis y Futuna', flag: '🇼🇫', format: '6 dígitos' },
    { code: '682', name: 'Islas Cook', flag: '🇨🇰', format: '5 dígitos' },
    { code: '683', name: 'Niue', flag: '🇳🇺', format: '4 dígitos' },
    { code: '684', name: 'Samoa Americana', flag: '🇦🇸', format: '7 dígitos' },
    { code: '685', name: 'Samoa', flag: '🇼🇸', format: '7 dígitos' },
    { code: '686', name: 'Kiribati', flag: '🇰🇮', format: '5-8 dígitos' },
    { code: '687', name: 'Nueva Caledonia', flag: '🇳🇨', format: '6 dígitos' },
    { code: '688', name: 'Tuvalu', flag: '🇹🇻', format: '5 dígitos' },
    { code: '689', name: 'Polinesia Francesa', flag: '🇵🇫', format: '6 dígitos' },
    { code: '690', name: 'Tokelau', flag: '🇹🇰', format: '4 dígitos' },
    { code: '691', name: 'Micronesia', flag: '🇫🇲', format: '7 dígitos' },
    { code: '692', name: 'Islas Marshall', flag: '🇲🇭', format: '7 dígitos' },
    { code: '850', name: 'Corea del Norte', flag: '🇰🇵', format: '8-11 dígitos' },
    { code: '852', name: 'Hong Kong', flag: '🇭🇰', format: '8 dígitos' },
    { code: '853', name: 'Macao', flag: '🇲🇴', format: '8 dígitos' },
    { code: '855', name: 'Camboya', flag: '🇰🇭', format: '8-9 dígitos' },
    { code: '856', name: 'Laos', flag: '🇱🇦', format: '8-10 dígitos' },
    { code: '880', name: 'Bangladesh', flag: '🇧🇩', format: '10 dígitos' },
    { code: '886', name: 'Taiwán', flag: '🇹🇼', format: '9 dígitos' },
    { code: '960', name: 'Maldivas', flag: '🇲🇻', format: '7 dígitos' },
    { code: '961', name: 'Líbano', flag: '🇱🇧', format: '8 dígitos' },
    { code: '962', name: 'Jordania', flag: '🇯🇴', format: '9 dígitos' },
    { code: '963', name: 'Siria', flag: '🇸🇾', format: '9 dígitos' },
    { code: '964', name: 'Irak', flag: '🇮🇶', format: '10 dígitos' },
    { code: '965', name: 'Kuwait', flag: '🇰🇼', format: '8 dígitos' },
    { code: '966', name: 'Arabia Saudí', flag: '🇸🇦', format: '9 dígitos' },
    { code: '967', name: 'Yemen', flag: '🇾🇪', format: '9 dígitos' },
    { code: '968', name: 'Omán', flag: '🇴🇲', format: '8 dígitos' },
    { code: '970', name: 'Palestina', flag: '🇵🇸', format: '9 dígitos' },
    { code: '971', name: 'Emiratos Árabes Unidos', flag: '🇦🇪', format: '9 dígitos' },
    { code: '972', name: 'Israel', flag: '🇮🇱', format: '9 dígitos' },
    { code: '973', name: 'Baréin', flag: '🇧🇭', format: '8 dígitos' },
    { code: '974', name: 'Catar', flag: '🇶🇦', format: '8 dígitos' },
    { code: '975', name: 'Bután', flag: '🇧🇹', format: '8 dígitos' },
    { code: '976', name: 'Mongolia', flag: '🇲🇳', format: '8 dígitos' },
    { code: '977', name: 'Nepal', flag: '🇳🇵', format: '10 dígitos' },
    { code: '992', name: 'Tayikistán', flag: '🇹🇯', format: '9 dígitos' },
    { code: '993', name: 'Turkmenistán', flag: '🇹🇲', format: '8 dígitos' },
    { code: '994', name: 'Azerbaiyán', flag: '🇦🇿', format: '9 dígitos' },
    { code: '995', name: 'Georgia', flag: '🇬🇪', format: '9 dígitos' },
    { code: '996', name: 'Kirguistán', flag: '🇰🇬', format: '9 dígitos' },
    { code: '998', name: 'Uzbekistán', flag: '🇺🇿', format: '9 dígitos' }
  ];

  // Load debtors when dialog opens
  useEffect(() => {
    if (open) {
      loadDebtors();
    }
  }, [open]);

  // Load debtors from API
  const loadDebtors = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/debtor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDebtors(response.data);
    } catch (err: any) {
      console.error('Error loading debtors:', err);
      setError('Error al cargar la lista de deudores');
    } finally {
      setLoading(false);
    }
  };

  // Handle debtor selection
  const handleDebtorSelect = (debtor: DebtorInfo) => {
    setSelectedDebtor(debtor);
    setFormData(prev => ({
      ...prev,
      debtorId: debtor.id,
      debtorName: debtor.name,
      document: debtor.document.toString()
    }));
    setActiveStep(1);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof PhoneFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate phone number for international format
  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    // Remove all spaces and non-digit characters except +
    const cleaned = phone.replace(/\s/g, '').replace(/[^\d]/g, '');
    
    // International phone number validation (7-15 digits)
    const phoneRegex = /^[0-9]{7,15}$/;
    
    // Check if it's a valid phone number
    if (!phoneRegex.test(cleaned)) {
      return false;
    }
    
    // Country-specific validation
    const countryValidations = {
      '593': (num: string) => num.length >= 9 && num.length <= 10, // Ecuador
      '58': (num: string) => num.length >= 10 && num.length <= 11, // Venezuela
      '57': (num: string) => num.length >= 10 && num.length <= 11, // Colombia
      '51': (num: string) => num.length >= 9 && num.length <= 10, // Peru
      '54': (num: string) => num.length >= 10 && num.length <= 11, // Argentina
      '56': (num: string) => num.length >= 9 && num.length <= 10, // Chile
      '55': (num: string) => num.length >= 10 && num.length <= 11, // Brazil
      '52': (num: string) => num.length >= 10 && num.length <= 11, // Mexico
      '1': (num: string) => num.length === 10, // USA/Canada
      '44': (num: string) => num.length >= 10 && num.length <= 11, // UK
      '49': (num: string) => num.length >= 10 && num.length <= 12, // Germany
      '33': (num: string) => num.length >= 9 && num.length <= 10, // France
      '39': (num: string) => num.length >= 9 && num.length <= 11, // Italy
      '34': (num: string) => num.length >= 9 && num.length <= 10, // Spain
    };
    
    const validation = countryValidations[countryCode as keyof typeof countryValidations];
    return validation ? validation(cleaned) : true; // Default to true if country not found
  };

  // Format phone number
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 12)}`;
  };

  // Handle phone number input
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({
      ...prev,
      phoneNumber: formatted
    }));
  };

  // Get selected country info
  const getSelectedCountryInfo = () => {
    return countryCodes.find(country => country.code === formData.countryCode);
  };

  // Get country-specific phone format help
  const getPhoneFormatHelp = () => {
    const country = getSelectedCountryInfo();
    if (!country) return '';
    
    const examples = {
      '593': 'Ejemplo: 9 1234 5678 o 09 1234 5678',
      '58': 'Ejemplo: 4 1234 5678 o 04 1234 5678',
      '57': 'Ejemplo: 3 1234 5678 o 03 1234 5678',
      '51': 'Ejemplo: 9 1234 5678 o 09 1234 5678',
      '54': 'Ejemplo: 9 1234 5678 o 09 1234 5678',
      '56': 'Ejemplo: 9 1234 5678 o 09 1234 5678',
      '55': 'Ejemplo: 11 91234 5678 o 21 91234 5678',
      '52': 'Ejemplo: 55 1234 5678 o 81 1234 5678',
      '1': 'Ejemplo: 555 123 4567',
      '44': 'Ejemplo: 20 1234 5678 o 7700 123456',
      '49': 'Ejemplo: 30 12345678 o 151 12345678',
      '33': 'Ejemplo: 1 23 45 67 89 o 6 12 34 56 78',
      '39': 'Ejemplo: 3 1234 5678 o 06 1234 5678',
      '34': 'Ejemplo: 91 123 45 67 o 612 34 56 78'
    };
    
    return examples[country.code as keyof typeof examples] || `Formato: ${country.format}`;
  };

  const handleCreatePhone = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('token');
      if (!token) {
          setError('No se encontró sesión activa. Por favor, inicie sesión nuevamente.');
          return;
      }

      let userId: number;
      try {
          const decoded = jwtDecode<TokenPayload>(token);
          userId = decoded.id; 
      } catch (e) {
          setError('Error de autenticación. Token inválido.');
          return;
      }

      // Validate form
      if (!formData.debtorId) {
        setError('Debe seleccionar un deudor');
        return;
      }

      if (!formData.phoneNumber) {
        setError('Debe ingresar un número de teléfono');
        return;
      }

      if (!validatePhoneNumber(formData.phoneNumber, formData.countryCode)) {
        setError(`Número de teléfono inválido para el código de país ${formData.countryCode}. Verifique el formato correcto.`);
        return;
      }


      const phoneData = {
        number: parseInt(formData.phoneNumber.replace(/\s/g, '')), // Cambiado a 'number' según tu nuevo modelo
        id_debtor: formData.debtorId, // Cambiado a 'id_debtor'
      };
      await axios.post(`${API_URL}/api/cellphone/${userId}`, phoneData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Success
      Swal.fire({
        title: '¡Teléfono creado exitosamente!',
        text: `Se ha agregado el teléfono ${formData.phoneNumber} al deudor ${formData.debtorName}`,
        icon: 'success',
        confirmButtonText: 'Continuar'
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(phoneData);
      }

      // Reset form and close
      handleClose();
    } catch (err: any) {
      console.error('Error creating phone:', err);
      const serverMessage = err.response?.data?.message || err.message;
      setError(serverMessage || 'Error al crear el teléfono');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      debtorName: '',
      document: '',
      phoneNumber: '',
      countryCode: '593',
      phoneType: 'cellphone',
      notes: ''
    });
    setSelectedDebtor(null);
    setError(null);
    onClose();
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && !selectedDebtor) {
      setError('Debe seleccionar un deudor');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Filter debtors based on search
  const filteredDebtors = debtors.filter(debtor =>
    debtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    debtor.document.toString().includes(searchQuery)
  );

  const steps = [
    'Seleccionar Deudor',
    'Información del Teléfono',
    'Confirmar y Crear'
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PhoneIcon color="primary" />
          <Typography variant="h6">
            Agregar Nuevo Teléfono
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select Debtor */}
          <Step>
            <StepLabel>Seleccionar Deudor</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre o documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />

                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {filteredDebtors.map((debtor) => (
                      <Grid item xs={12} sm={6} md={4} key={debtor.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-2px)'
                            },
                            border: selectedDebtor?.id === debtor.id ? '2px solid #1976d2' : 'none'
                          }}
                          onClick={() => handleDebtorSelect(debtor)}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                              <PersonIcon color="primary" />
                              <Box>
                                <Typography variant="h6" noWrap sx={{ fontSize: '1rem' }}>
                                  {debtor.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Doc: {debtor.document}
                                </Typography>
                                <Chip
                                  label={debtor.status}
                                  size="small"
                                  color={debtor.status === 'active' ? 'success' : 'default'}
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {filteredDebtors.length === 0 && !loading && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No se encontraron deudores con ese criterio de búsqueda
                  </Alert>
                )}
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Phone Information */}
          <Step>
            <StepLabel>Información del Teléfono</StepLabel>
            <StepContent>
              {selectedDebtor && (
                <Box sx={{ mb: 2 }}>
                  <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Deudor Seleccionado
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <PersonIcon color="primary" />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedDebtor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Documento: {selectedDebtor.document}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Teléfono</InputLabel>
                        <Select
                          value={formData.phoneType}
                          onChange={(e: any) => handleInputChange('phoneType', e.target.value)}
                        >
                          <MenuItem value="cellphone">Celular</MenuItem>
                          <MenuItem value="telephone">Teléfono Fijo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Código de País</InputLabel>
                        <Select
                          value={formData.countryCode}
                          onChange={(e: any) => handleInputChange('countryCode', e.target.value)}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                        >
                          {countryCodes.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography>{country.flag}</Typography>
                                <Typography variant="body2">
                                  {country.name} (+{country.code})
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Número de Teléfono"
                        value={formData.phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="Ej: 0987654321"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          )
                        }}
                        helperText="Ingrese el número sin el código de país"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notas (Opcional)"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Información adicional..."
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>

                  {formData.phoneNumber && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <InfoIcon />
                        <Typography variant="body2">
                          Número completo: +{formData.countryCode} {formData.phoneNumber}
                        </Typography>
                      </Box>
                    </Alert>
                  )}
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Confirm */}
          <Step>
            <StepLabel>Confirmar y Crear</StepLabel>
            <StepContent>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen del Teléfono
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Deudor
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formData.debtorName}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Número Completo
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          +{formData.countryCode} {formData.phoneNumber}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon />
                  <Typography variant="body2">
                    ¡Todo listo! El teléfono será agregado al sistema.
                  </Typography>
                </Box>
              </Alert>
            </StepContent>
          </Step>
        </Stepper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
          >
            Anterior
          </Button>
        )}
        
        {activeStep < steps.length - 1 && (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={loading || (activeStep === 0 && !selectedDebtor)}
          >
            Siguiente
          </Button>
        )}
        
        {activeStep === steps.length - 1 && (
          <Button
            onClick={handleCreatePhone}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {loading ? 'Creando...' : 'Crear Teléfono'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedCreatePhone;