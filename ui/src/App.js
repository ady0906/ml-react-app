import React, { Component } from 'react';
import ReactDOM from "react-dom";
import CanvasDraw from "react-canvas-draw";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      canvasData: {
        color: "#222",
        radius: 5,
        width: 300,
        height: 300,
        lazyRadius: 2
        // hideGrid: true
      },
      // formData: {
      //   textfield1: '',
      //   textfield2: '',
      //   select1: 1,
      //   select2: 1,
      //   select3: 1
      // },
      finalWord: "",
      currentLetter: ""
    };
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    var formData = this.state.formData;
    this.setState({
      formData
    });
    formData[name] = value;
    // var canvasData = this.state.canvasData;
    // this.setState({
    //   canvasData
    // });
    // canvasData[name] = value;
  }


  handleSaveClick = (event) => {
    localStorage.setItem("savedDrawing", this.saveableCanvas.getSaveData());

    let drawing = this.saveableCanvas.canvas.drawing;
    let drawingUrl = drawing.toDataURL('image/png');

    // cleanUpJSON = (s) => {
    //   s = s.replace(/\\n/g, "\\n")  
    //              .replace(/\\'/g, "\\'")
    //              .replace(/\\"/g, '\\"')
    //              .replace(/\\&/g, "\\&")
    //              .replace(/\\r/g, "\\r")
    //              .replace(/\\t/g, "\\t")
    //              .replace(/\\b/g, "\\b")
    //              .replace(/\\f/g, "\\f");
    //   s = s.replace(/[\u0000-\u0019]+/g,""); 
    //   var o = JSON.parse(s);
    //   return o;
    // }

    this.setState({ isLoading: true });
    fetch('http://localhost:5000/prediction/',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(drawingUrl)
      })
      .then(response => response.json())
      .then(response => {
        response = response.replace(/'/g,'"');
        let obj = JSON.parse(response);
        console.log(obj['prediction']);

        this.setState({
          result: response,

          // currentLetter: response[0][0],
          isLoading: false
        });
      });
  }

  handlePredictClick = (event) => {
    const formData = this.state.formData;
    this.setState({ isLoading: true });
    fetch('http://127.0.0.1:5000/prediction/', 
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(response => {
        this.setState({
          result: response.result,

          isLoading: false
        });
      });
  }

  handleCancelClick = (event) => {
    this.setState({ result: "" });
  }

  render() {
    const isLoading = this.state.isLoading;
    const formData = this.state.formData;
    const canvasData = this.state.canvasData;
    const result = this.state.result;

    return (
      <Container>
        <div>
          <h1 className="title">Griffonne</h1>
        </div>
        <div className="content">
          <CanvasDraw id="canvas" ref={canvasDraw => (this.saveableCanvas = canvasDraw)} brushRadius={canvasData.radius} brushColor={canvasData.color} lazyRadius={canvasData.lazyRadius}/>
          <Button block onClick={this.handleSaveClick}>
            Save
          </Button>
          <Button block variant="danger"onClick={() => {this.saveableCanvas.clear();}}>
            Clear
          </Button>
          {result === "" ? null :
            (<Row>
              <Col className="result-container">
                <h5 id="result">{result}</h5>
              </Col>
            </Row>)
          }
        </div>
      </Container>
    );
  }
}

export default App;