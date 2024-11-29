import React, { Component } from "react";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.props.set_data(json);
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.trim().split("\n"); // Split by rows
    const headers = lines[0].split(","); // Extract headers
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(","); // Split each line by comma
      const obj = {};

      headers.forEach((header, index) => {
        obj[header.trim()] =
          index === 0
            ? currentLine[index]?.trim() // Keep Date as string
            : parseInt(currentLine[index], 10) || 0; // Replace missing with 0
      });

      if (Object.keys(obj).length && lines[i].trim()) {
        result.push(obj);
      }
    }

    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => this.setState({ file: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
