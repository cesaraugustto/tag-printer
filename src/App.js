import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useReactToPrint } from 'react-to-print';
import Papa from 'papaparse';
import qrCode from './qrCode.png';
import SinosteelLogo from './sinosteel-logo.png';
import { Alert } from 'react-bootstrap';
import ViewerLogo from './3dViewer/ViewerLogo';

function App() {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

  const fileInputRef = useRef();

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const csv = e.target.result;
      const results = Papa.parse(csv, { header: true });
      const cleanData = results.data.filter(item => item.id); // Filter out empty rows
      const validData = validateData(cleanData);

      if (validData.isValid) {
        setData(cleanData);
      } else {
        setAlert({ message: validData.message, type: 'danger' });
        setTimeout(() => {
          setAlert({ message: '', type: '' });
        }, 3000);
      }
    };

    reader.readAsText(file);
  };

  const validateData = (data) => {
    const requiredHeaders = ['id', 'draw', 'equipament', 'sku', 'description', 'qte', 'supplier'];
    const headers = Object.keys(data[0]);

    for (let header of requiredHeaders) {
      if (!headers.includes(header)) {
        return { isValid: false, message: `Cabeçalho faltando: ${header}` };
      }
    }

    for (let item of data) {
      if (item.qte <= 0) {
        return { isValid: false, message: `Quantidade inválida para o item com ID: ${item.id}` };
      }
    }

    return { isValid: true };
  };

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      setAlert({ message: 'Etiquetas impressas com sucesso!', type: 'success' });
      setTimeout(() => {
        setAlert({ message: '', type: '' });
      }, 5000);
    },
    onPrintError: () => {
      setAlert({ message: 'Erro ao imprimir etiquetas.', type: 'danger' });
      setTimeout(() => {
        setAlert({ message: '', type: '' });
      }, 5000);
    }
  });

  const handleSelectRow = (id) => {
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter(rowId => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map(item => item.id));
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm)
    )
  );

  const selectedData = data.filter(item => selectedRows.includes(item.id));

  // Replicate selected lines in the second table
  const replicatedData = selectedData.flatMap(item =>
    Array.from({ length: item.qte }, () => item)
  );

  return (
    <div className="container">
      <Row className="my-2 align-items-center">
        <Col>
          <Row>
            <Col className="d-flex justify-content-start align-items-center" style={{ height: '50%' }}>
              <h2>Gestão Quantum</h2>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-start align-items-center" style={{ height: '50%' }}>
              <h5>Automação para impressão de etiquetas</h5>
            </Col>
          </Row>
          <Row className="">
            <Col>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current.click()}
              >
                Carregar CSV
              </button>
            </Col>
          </Row>
        </Col>
        <Col lg={3} className="d-flex justify-content-end align-items-end">
          <ViewerLogo />
        </Col>
      </Row>
      {alert.message && (
        <Alert variant={alert.type} className="fade-alert">
          {alert.message}
        </Alert>
      )}



      <Row className="my-2">
        <Col>
          <input
            type="text"
            placeholder="Pesquise aqui"
            className="form-control"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <div style={{ height: '50vh', overflowY: 'auto' }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleSelectAllRows}
                      checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    />
                  </th>
                  <th>Desenho</th>
                  <th>Equipamento</th>
                  <th>SKU</th>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </td>
                    <td>{item.draw}</td>
                    <td>{item.equipament}</td>
                    <td>{item.sku}</td>
                    <td>{item.description.slice(0, 30)}</td>
                    <td>{item.qte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>
          <h3>Linhas Selecionadas</h3>
        </Col>
        <Col className="d-flex justify-content-end align-items-end">
          <button onClick={handlePrint} className="btn btn-primary">Imprimir</button>
        </Col>
      </Row>
      <Row>
        <Col>
          <div style={{ height: '50vh', overflowY: 'auto' }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Desenho</th>
                  <th>Equipamento</th>
                  <th>SKU</th>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.map(item => (
                  <tr key={item.id}>
                    <td>{item.draw}</td>
                    <td>{item.equipament}</td>
                    <td>{item.sku}</td>
                    <td>{item.description.slice(0, 30)}</td>
                    <td>{item.qte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
      <div style={{ display: 'none' }}>
        <PrintableTable ref={componentRef} data={replicatedData} />
      </div>
    </div>
  );
}

const PrintableTable = React.forwardRef(({ data }, ref) => (
  <div ref={ref} className="container">
    <style>
      {`
        @media print {
          .qr-code-img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
          }
        }
        .fade-alert {
          opacity: 1;
          transition: opacity 1s ease-in-out;
        }
      `}
    </style>
    {data.map((item, index) => (
      <div className="row mb-3" key={index} style={{ pageBreakInside: 'avoid' }}>
        <div className="col-8">
          <h5>Fornecedor: {item.supplier}</h5>
          <p className="p-0 m-0"><strong>DESENHO:</strong> {item.draw}</p>
          <p className="p-0 m-0"><strong>TAG:</strong> {item.equipament}</p>
          <p className="p-0 m-0"><strong>SKU:</strong> {item.sku}</p>
          <p className="p-0 m-0"><strong>DESCRIÇÃO:</strong> {item.description}</p>
        </div>
        <div className="col-4 text-center">
          <img src={qrCode} className="img-fluid qr-code-img" alt="QR Code" />
        </div>
      </div>
    ))}
  </div>
));

export default App;
