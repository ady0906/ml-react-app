import React, { Component } from 'react';
import ReactDOM from "react-dom";
import ReactTypingEffect from 'react-typing-effect';
import CanvasDraw from "react-canvas-draw";
import Container from 'react-bootstrap/Container';
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
        width: 250,
        height: 150,
        lazyRadius: 2
        // hideGrid: true
      },
      result: "",
      justChanged: false,
      currentLetter: ""
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  handleChange = (event) => {
    this.setState({ justChanged: true });

    setTimeout(() => {
      this.setState({ justChanged: false });

      if (!this.state.justChanged && !this.state.isLoading) {
        let drawing = this.saveableCanvas.canvas.drawing;
        let drawingUrl = drawing.toDataURL('image/png');
        this.saveableCanvas.clear();

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
            let prediction = obj['prediction'];

            let str = this.state.result;
            for (var i = 0; i < prediction.length; i++) {

                let lastChar = str.substr(str.length - 1);
                let newChar = prediction[i][0][0];

                if (str === '') {
                  str += newChar.toUpperCase();
                } else if (lastChar !== ' ') {
                  str += newChar.toLowerCase();
                } else {
                  str += newChar;
                }
            }

            this.setState({
              result: str,
              isLoading: false
            });
          });
        }
    }, 1700);
  }


  handleBackSpace = (event) => {
    let str = this.state.result;
    let newStr = str.slice(0, -1);
    this.setState({ result: newStr });
  }

  handleSpace = (event) => {
    let str = this.state.result + ' ';
    this.setState({ result: str });
  }

  handleReset = (event) => {
    this.setState({ result: '' });
  }

  handleKeyDown = (event) => {
    let code = event.keyCode;
    if (code == 32) {
      this.handleSpace(event);
    } else if (code == 8) {
      this.handleBackSpace(event);
    } else if (code == 82) {
      this.handleReset(event);
    }
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

  render() {
    const isLoading = this.state.isLoading;
    const canvasData = this.state.canvasData;
    const result = this.state.result;

    return (
      <Container>
        <div>
          <h1 className="title"><ReactTypingEffect staticText={result === "" ? 'Griffonne' : result}/></h1>
        </div>
        <div className="content">
          <CanvasDraw id="canvas" ref={canvasDraw => (this.saveableCanvas = canvasDraw)} brushRadius={canvasData.radius} brushColor={canvasData.color} lazyRadius={canvasData.lazyRadius} onChange={this.handleChange}/>
          <Button block onClick={this.handleSpace}>
            Espace
          </Button>
          <Button block variant="secondary"onClick={this.handleBackSpace}>
            Retour
          </Button>
          <Button block variant="danger"onClick={this.handleReset}>
            Réinitialiser
          </Button>
        </div>
      </Container>
    );
  }
}

export default App;