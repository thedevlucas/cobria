// Css
import "/src/static/css/chat/UploadOptions.css";
import "/src/static/css/chat/UploadExcel.css";
// Dependencies
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { useEffect, useMemo, useState } from "react";
// Icons
import PhoneIcon from "@mui/icons-material/Phone";
// Components
import MenuComponent from "../../components/menu/MenuComponent";
// Helpers
import { uploadFile } from "../../helpers/chat/UploadHelper";
// Styles
import { styleUploadOptionsProps } from "../../styles/UploadStyle";
// Material UI imports
import Button from "@mui/material/Button";
import EditableTable from "../../components/editTable/EditableTable";
import { Box } from "@mui/material";
import TimeDaySelector from "../../components/timeDaySelector/TimeDaySelector";
import { getAgents } from "../../helpers/agents/AgentsHelpers";
import {
  DateSelectResponse,
  getMyDateSelect,
  postMyDateSelect,
} from "../../helpers/company/DateSelect";
import { getClients } from "../../helpers/company/ClientHelper";
import CountryCodeSelector from "../../components/selectors/CountryCodeSelector";
import {
  CollectionType,
  CountryType,
  defaultCountryCode,
} from "../../constants/Constants";
import { checkAdmin } from "../../helpers/user/CheckAdmin";

interface ExcelRow {
  [key: string]: string | number;
}
interface PhoneNumber {
  name: string;
  phone: string;
}

function DropZone(): JSX.Element {
  const navigate = useNavigate();
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [isExcelAdd, setIsExcelAdd] = useState<boolean>(false);
  const [isModalAdvOpen, setIsModalAdvOpen] = useState<boolean>(false);
  const [isModalDateOpen, setIsModalDateOpen] = useState<boolean>(false);
  const [isModalCallCostsOpen, setIsModalCallCostsOpen] =
    useState<boolean>(false);
  const [isModalNumbersOpen, setIsModalNumbersOpen] = useState<boolean>(false);
  const [rowCount, setRowCount] = useState<number>();
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");
  const [myDate, setMyDate] = useState<DateSelectResponse>({
    daysOfWeek: [],
    endTime: "",
    startTime: "",
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | undefined>(
    undefined
  );
  const [agentsNumbers, setAgentsNumbers] = useState<PhoneNumber[]>();
  const [clients, setClients] = useState<Record<string, string | number>[]>([]);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<number>();
  const [collectionType, setCollectionType] = useState<CollectionType>(
    CollectionType.Whatsapp
  );
  const [isCountryCodeModalOpen, setIsCountryCodeModalOpen] =
    useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryType | null>(
    defaultCountryCode
  );

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const results = await getAgents();
        setAgentsNumbers(results);
      } catch (error) {
        alert("Error al buscar números. Revisa la consola para más detalles.");
        console.error(error);
      }
    };

    const fetchMyDate = async () => {
      try {
        const results = await getMyDateSelect();
        console.log(myDate);

        setMyDate(results);
      } catch (error) {
        alert("Error al ");
        console.error(error);
      }
    };

    const fetchClients = async () => {
      try {
        const results = await getClients();
        setClients(results);
      } catch (error) {
        alert("Error al buscar clientes. Revisa la consola para más detalles.");
        console.error(error);
      }
    };

    fetchMyDate();
    fetchAgents();
    fetchClients();
  }, []);

  const price = useMemo(() => (rowCount ?? 0) * 0.0339, [rowCount]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
      "application/csv": [".csv"],
    },
    onDrop: (acceptedFiles: File[], rejectedFiles: any[]) => {
      console.log("Accepted files:", acceptedFiles);
      console.log("Rejected files:", rejectedFiles);
      
      if (acceptedFiles.length > 0) {
        handleFileRead(acceptedFiles[0]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El archivo que intentas subir no es un archivo válido (Excel o CSV)",
        });
      }
    },
    onDropRejected: (rejectedFiles: any[]) => {
      console.log("Files rejected:", rejectedFiles);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El archivo que intentas subir no es un archivo válido (Excel o CSV)",
      });
    },
  });

  const handleFileRead = (file: File): void => {
    // Validate that the file is actually a File object
    if (!file || !(file instanceof File)) {
      console.error("Invalid file object:", file);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El archivo seleccionado no es válido",
      });
      return;
    }

    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        try {
          let jsonData: ExcelRow[] = [];

          // Check if it's a CSV file
          if (file.type === "text/csv" || file.type === "application/csv" || file.name.toLowerCase().endsWith('.csv')) {
            // Handle CSV file
            const csvText = e.target.result as string;
            const lines = csvText.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length === 0) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "El archivo CSV está vacío",
              });
              return;
            }

            // Parse CSV
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            jsonData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: ExcelRow = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
          } else {
            // Handle Excel file
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet, {
              defval: "",
            });
          }
          
          // Check if jsonData is empty or has no rows
          if (!jsonData || jsonData.length === 0) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "El archivo está vacío o no contiene datos válidos",
            });
            return;
          }

          // Verificar si ya existe la columna "Cliente"
          if (!Object.prototype.hasOwnProperty.call(jsonData[0], "Cliente")) {
            // Añadir la columna "Cliente" si no existe
            jsonData = jsonData.map((row) => ({
              ...row,
              Cliente: "", // Inicializar con un valor vacío
            }));
          }

          // Filtrar las columnas sin encabezado
          const filteredData = jsonData.map((row) => {
            const filteredRow: ExcelRow = {};
            Object.keys(row).forEach((key) => {
              if (key.trim() !== "" && !key.includes("EMPTY")) {
                // Eliminar columnas con encabezado vacío o "EMPTY"
                filteredRow[key] = row[key];
              }
            });
            return filteredRow;
          });

          setExcelData(filteredData || []);
          setRowCount(filteredData?.length || 0);
          setIsExcelAdd(true);
          
          console.log("File processed successfully:", filteredData.length, "rows");
        } catch (error) {
          console.error("Error processing file:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al procesar el archivo. Asegúrate de que sea un archivo válido (Excel o CSV).",
          });
        }
      }
    };
    
    reader.onerror = () => {
      console.error("FileReader error");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al leer el archivo",
      });
    };
    
    // Use readAsText for CSV files, readAsArrayBuffer for Excel files
    if (file.type === "text/csv" || file.type === "application/csv" || file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDataChange = (
    index: number,
    field: string,
    value: string | number
  ): void => {
    const updatedData = [...excelData];
    updatedData[index][field] = value;
    setExcelData(updatedData);
  };

  const [admin, setAdmin] = useState<boolean>(false);
  useEffect(() => {
    checkAdmin().then((response) => {
      setAdmin(response);
    });
  }, []);

  const saveChanges = (source: "whatsapp" | "sms" | "email" | "call"): void => {
    setIsModalAdvOpen(false);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBlob = new Blob(
      [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
      { type: "application/octet-stream" }
    );
    const file = new File([excelBlob], "modified_excel.xlsx");

    //ARG code fix for whatsapp
    let countryCodeToSend = selectedCountry?.phone || defaultCountryCode.phone;
  
    if (countryCodeToSend === "54" && source === "whatsapp") {
      countryCodeToSend = "549";
    }

    uploadFile(
      file,
      navigate,
      source,
      countryCodeToSend,
      selectedClient,
      selectedNumber
    );
  };

  return (
    <>
      {isExcelAdd ? (
        <div className="container-excel">
          <h2>Edita los datos</h2>
          <div>
            <EditableTable data={excelData} onDataChange={handleDataChange} />
          </div>

          {/* Botón Guardar en la parte inferior */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              // zIndex: 1000,
              position: "fixed",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              gap: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Sombra para dar efecto flotante
              padding: "10px", // Espaciado interno
              borderRadius: "10px",
              width: "97%",
              marginTop: "20px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setIsModalDateOpen(true);
                  setCollectionType(CollectionType.Whatsapp);
                }}
              >
                Empezar cobranza por whatsapp
              </Button>
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsModalDateOpen(true);
                  setCollectionType(CollectionType.Call);
                }}
              >
                Empezar cobranza por llamada
              </Button>
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  setIsModalDateOpen(true);
                  setCollectionType(CollectionType.Sms);
                }}
              >
                Empezar cobranza por sms
              </Button>
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setIsModalDateOpen(true);
                  setCollectionType(CollectionType.Email);
                }}
              >
                Empezar cobranza por correo
              </Button>
            </Box>
          </div>
        </div>
      ) : (
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <PhoneIcon style={styleUploadOptionsProps} />
          <p>
            Arrastra el archivo Excel o CSV a este contenedor, o haz click para buscar el
            archivo.
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalDateOpen}
        onRequestClose={() => {
          setIsModalDateOpen(false);
        }}
        style={{
          content: {
            width: "500px", // Ancho del modal
            height: "300px", // Altura del modal
            margin: "auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>Seleccione la fecha disponible</h2>
        <TimeDaySelector
          fromTime={fromTime}
          toTime={toTime}
          selectedDays={selectedDays}
          setFromTime={setFromTime}
          setToTime={setToTime}
          setSelectedDays={setSelectedDays}
        />

        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setIsModalDateOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!fromTime || !toTime || selectedDays.length === 0}
            onClick={() => {
              postMyDateSelect({ selectedDays, fromTime, toTime });
              setIsModalDateOpen(false);
              setIsCountryCodeModalOpen(true);
            }}
          >
            Siguiente
          </Button>
        </Box>
      </Modal>

      <Modal
        isOpen={isCountryCodeModalOpen}
        onRequestClose={() => {
          setIsModalDateOpen(false);
        }}
        style={{
          content: {
            width: "500px", // Ancho del modal
            height: "300px", // Altura del modal
            margin: "auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          Elije el codigo de pais para la cobranza
        </h2>
        <CountryCodeSelector handleCountryChange={setSelectedCountry} />

        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setIsCountryCodeModalOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setIsCountryCodeModalOpen(false);
              switch (collectionType) {
                case CollectionType.Whatsapp:
                  if (admin) {
                    setIsModalAdvOpen(true);
                    return;
                  }

                  if (!clients?.length) {
                    Swal.fire({
                      icon: "warning",
                      title: "Oops...",
                      text: "Necesitará su número de agente para continuar con el proceso de cobro. Actualmente no hay ningún número de agente asignado a usted. Pídale a su gerente el número del consejero.",
                    });
                    // setIsModalAdvOpen(true);
                    return;
                  }

                  setIsClientsModalOpen(true);
                  break;
                case CollectionType.Call:
                  if (admin) {
                    setIsModalCallCostsOpen(true);
                    return;
                  }
                  if (!agentsNumbers?.length) {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Necesitará su número de agente para continuar con el proceso de cobro. Actualmente no hay números de agente disponibles asignados a usted. Puedes pedirle a tu administrador tu número de agente.",
                    });
                    return;
                  }
                  setIsModalNumbersOpen(true);
                  break;
                case CollectionType.Sms:
                  saveChanges("sms");
                  break;
                case CollectionType.Email:
                  saveChanges("email");
                  break;
              }
            }}
          >
            Siguiente
          </Button>
        </Box>
      </Modal>

      {/* Modal para seleccionar un cliente */}
      <Modal
        isOpen={isClientsModalOpen && !!clients?.length}
        onRequestClose={() => setIsClientsModalOpen(false)}
        style={{
          content: {
            width: "300px", // Ancho del modal
            height: "400px", // Altura del modal
            margin: "auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>Seleccione un cliente</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "20px 0",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "left",
                }}
              ></th>
              <th
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "left",
                }}
              >
                Nombre
              </th>
            </tr>
          </thead>
          <tbody style={{ height: "100px", overflowY: "auto" }}>
            {!!clients?.length &&
              clients.map((entry, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedClient === entry.id}
                      onChange={() => setSelectedClient(entry.id as number)}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>{entry.name}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsClientsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (selectedClient) {
                setIsClientsModalOpen(false);
                setIsModalAdvOpen(true);
              } else {
                alert("Por favor seleccione un número.");
              }
            }}
          >
            Enviar
          </Button>
        </Box>
      </Modal>

      {/* Modal para seleccionar un número telefónico / agente */}
      <Modal
        isOpen={isModalNumbersOpen && !!agentsNumbers?.length}
        onRequestClose={() => setIsModalNumbersOpen(false)}
        style={{
          content: {
            width: "500px", // Ancho del modal
            height: "400px", // Altura del modal
            margin: "auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>Seleccione un número telefónico</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "20px 0",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "left",
                }}
              ></th>
              <th
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "left",
                }}
              >
                Nombre
              </th>
              <th
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "left",
                }}
              >
                Número
              </th>
            </tr>
          </thead>
          <tbody>
            {agentsNumbers?.length &&
              agentsNumbers.map((entry) => (
                <tr key={entry.phone}>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedNumber === entry.phone}
                      onChange={() => setSelectedNumber(entry.phone)}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>{entry.name}</td>
                  <td style={{ padding: "10px" }}>{entry.phone}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (selectedNumber) {
                setIsModalNumbersOpen(false);
                setIsModalCallCostsOpen(true);
              } else {
                alert("Por favor seleccione un número.");
              }
            }}
          >
            Siguiente
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsModalNumbersOpen(false)}
          >
            Cancelar
          </Button>
        </Box>
      </Modal>

      {/* Modal de advertencia del costo aprox para la cobranza por whatsapp */}
      <Modal
        isOpen={isModalAdvOpen}
        onRequestClose={() => setIsModalAdvOpen(false)}
        style={{
          content: {
            width: "300px", // Ancho del modal
            height: "200px", // Altura del modal
            margin: "auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          ¿Estás seguro que deseas guardar los cambios?
        </h2>
        <p style={{ textAlign: "center" }}>
          Se le cobrará el siguiente monto {price} $
        </p>

        {/* Botón Guardar en la parte inferior */}
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="contained"
            color="primary"
            onClick={() => saveChanges("whatsapp")}
          >
            Aceptar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsModalAdvOpen(false)}
          >
            Cancelar
          </Button>
        </Box>
      </Modal>

      {/* Modal de advertencia del costo aprox para la cobranza por llamada */}
      <Modal
        isOpen={isModalCallCostsOpen}
        onRequestClose={() => setIsModalCallCostsOpen(false)}
        style={{
          content: {
            width: "300px", // Ancho del modal
            height: "200px", // Altura del modal
            margin: "auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          Empezara la cobranza por llamada
        </h2>
        <p style={{ textAlign: "center" }}>
          El costo por minuto de llamada es de $0.238
        </p>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              saveChanges("call");
              setIsModalCallCostsOpen(false);
            }}
          >
            Aceptar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsModalCallCostsOpen(false)}
          >
            Cancelar
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default function UploadExcel(): JSX.Element {
  return (
    <div className="all">
      {MenuComponent()}
      <main>
        <div className="upload-options-container">
          <DropZone />
        </div>
      </main>
    </div>
  );
}
