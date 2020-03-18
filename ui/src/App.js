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
        width: 800,
        height: 400,
        lazyRadius: 5
        // hideGrid: true
      },
      formData: {
        textfield1: '',
        textfield2: '',
        select1: 1,
        select2: 1,
        select3: 1
      },
      result: ""
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
    console.log('bloop');
    localStorage.setItem("savedDrawing", this.saveableCanvas.getSaveData());
    console.log(localStorage);

    console.log('bleep');
    console.log(this.saveableCanvas);

    console.log('blong');
    console.log(this.saveableCanvas.canvas.drawing.toDataURL('image/png'));
    let canvas = this.saveableCanvas.canvas.interface;
    let canvasContainer = this.saveableCanvas.canvas.canvasContainer;
    // let canvas = this.saveableCanvas;
    console.log(canvas);
    console.log(canvas.toDataURL('image/png'));

    console.log(canvasContainer);
    console.log(canvasContainer.toDataURL('image/png'))
    // let dataURL = canvas.toDataURL('image/png');
    // console.log(dataURL);

    // const formData = this.state.formData;
    // this.setState({ isLoading: true });
    // fetch('http://127.0.0.1:5000/prediction/', 
    //   {
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json'
    //     },
    //     method: 'POST',
    //     body: JSON.stringify(formData)
    //   })
    //   .then(response => response.json())
    //   .then(response => {
    //     this.setState({
    //       result: response.result,
    //       isLoading: false
    //     });
    //   });
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
          <h1 className="title">Predict a letter</h1>
        </div>
        <div className="content">
          <CanvasDraw id="canvas" ref={canvasDraw => (this.saveableCanvas = canvasDraw)} brushRadius={canvasData.radius} brushColor={canvasData.color} lazyRadius={canvasData.lazyRadius}/>
          <Button block onClick={this.handleSaveClick}>
            Save
          </Button>
          <Button block variant="danger"onClick={() => {this.saveableCanvas.clear();}}>
            Clear
          </Button>
          <Form>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Text Field 1</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Text Field 1" 
                  name="textfield1"
                  value={formData.textfield1}
                  onChange={this.handleChange} />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Text Field 2</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Text Field 2" 
                  name="textfield2"
                  value={formData.textfield2}
                  onChange={this.handleChange} />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Select 1</Form.Label>
                <Form.Control 
                  as="select"
                  value={formData.select1}
                  name="select1"
                  onChange={this.handleChange}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Select 2</Form.Label>
                <Form.Control 
                  as="select"
                  value={formData.select2}
                  name="select2"
                  onChange={this.handleChange}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Select 3</Form.Label>
                <Form.Control 
                  as="select"
                  value={formData.select3}
                  name="select3"
                  onChange={this.handleChange}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </Form.Control>
              </Form.Group>
            </Form.Row>
            <Row>
              <Col>
                <Button
                  block
                  variant="success"
                  disabled={isLoading}
                  onClick={!isLoading ? this.handlePredictClick : null}>
                  { isLoading ? 'Making prediction' : 'Predict' }
                </Button>
              </Col>
              <Col>
                <Button
                  block
                  variant="danger"
                  disabled={isLoading}
                  onClick={this.handleCancelClick}>
                  Reset prediction
                </Button>
              </Col>
            </Row>
          </Form>
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