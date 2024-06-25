import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAboutOverlay, setShowAboutOverlay] = useState(false);
  const [showFactorsOverlay, setShowFactorsOverlay] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const PAT = '85825232720b4893bcefbcfc4a0b3a4b';
    const USER_ID = 'clarifai';
    const APP_ID = 'main';
    const MODEL_ID = 'moderation-multilingual-text-classification';
    const MODEL_VERSION_ID = '79c2248564b0465bb96265e0c239352b';
    const RAW_TEXT = text;

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "text": {
              "raw": RAW_TEXT
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT,
        'Content-Type': 'application/json'
      },
      body: raw
    };

    fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.outputs && data.outputs.length > 0) {
            const concepts = data.outputs[0].data.concepts;
            concepts.sort((a, b) => b.value - a.value);
            setResult(concepts);
          } else {
            setResult('No results found.');
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setResult('An error your limit is mostly run out, dont worry try later.');
          setLoading(false);
        });
  };

  const renderResult = () => {
    if (result === 'No results found.' || result === 'An error occurred.') {
      return <p>{result}</p>;
    }

    const filteredResults = result.filter(concept => concept.value >= 0.4);
    if (filteredResults.length === 0) {
      return <div className="safe-message">The text is SAFE</div>;
    }

    return (
        <div className="results">
          {filteredResults.map((concept, index) => {
            let resultClass = 'result-item';
            if (concept.value >= 0.8) {
              resultClass += ' result-high';
            } else if (concept.value >= 0.4) {
              resultClass += ' result-medium';
            }
            return (
                <div key={index} className={resultClass}>
                  <span className="result-name">{concept.name}</span>: <span className="result-value">{concept.value.toFixed(2)}</span>
                </div>
            );
          })}
        </div>
    );
  };

  const handleOverlayClick = (overlaySetter) => {
    overlaySetter(false);
  };

  return (
      <div className="App">
        {showAboutOverlay && (
            <div className="overlay" onClick={() => handleOverlayClick(setShowAboutOverlay)}>
              <div className="overlay-content">
                <h2>Multilingual Text Moderation</h2>
                <p>


                  This application uses a multilingual text moderation model. The base training is in English, but it
                  can accurately check for content in Arabic, Hindi, Kannada, French, malayalam, Spanish, and Urdu.
                  <br/>
                  It is highly accurate
                  and can account for language-specific phrases.
                </p>
              </div>
            </div>
        )}
        {showFactorsOverlay && (
            <div className="overlay" onClick={() => handleOverlayClick(setShowFactorsOverlay)}>
              <div className="overlay-content">
                <h2>Factors</h2>
                <p>
                  <strong>Toxicity:</strong> General mean or toxic (need not have swear words)
                  <br />
                  <strong>Insult:</strong> Detects offensive and demeaning statements.
                  <br />
                  <strong>Profanity:</strong> Flags any vulgar language.
                  <br />
                  <strong>Threat:</strong> Recognizes threatening language in context.
                  <br />
                  <strong>Identity Attack:</strong> Detects attacks targeting a race, caste, etc.
                </p>
              </div>
            </div>
        )}
        <header className="App-header">
          <div className="header-bar">
            <button className="header-button" onClick={() => setShowAboutOverlay(true)}>About</button>
            <button className="header-button" onClick={() => setShowFactorsOverlay(true)}>Factors</button>
          </div>
          <h1>Text Moderation App</h1>
          <form onSubmit={handleSubmit}>
          <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text to moderate"
              rows="4"
              cols="50"
              className="App-textarea"
          />
            <br />
            <button type="submit" className="App-button" disabled={loading}>
              {loading ? 'Moderating...' : 'Moderate Text'}
            </button>
          </form>
          {result && (
              <div className="result-container">
                <h2>Result:</h2>
                {renderResult()}
              </div>
          )}
        </header>
        <footer className="App-footer">
          <p>&copy; 2024 Made by Akash Rao Inc.</p>
        </footer>
      </div>
  );
}

export default App;
