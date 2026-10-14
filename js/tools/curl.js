/**
 * DevForge - cURL Converter
 * Converts cURL commands into JavaScript (fetch, axios), Python (requests), Go, and Rust.
 */

export function parseCurl(curlString) {
  if (!curlString || typeof curlString !== 'string') {
    throw new Error('Please enter a valid cURL command.');
  }

  // Normalize line continuations and multiple spaces
  const clean = curlString.replace(/\\\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  if (!clean.toLowerCase().startsWith('curl')) {
    throw new Error('Command must begin with "curl".');
  }

  // Regex token extraction respecting quotes
  const tokens = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match;
  while ((match = regex.exec(clean)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
  }

  let method = 'GET';
  let url = '';
  const headers = {};
  let data = null;
  let auth = null;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      method = (tokens[++i] || 'GET').toUpperCase();
    } else if (token === '-H' || token === '--header') {
      const headerLine = tokens[++i] || '';
      const colonIdx = headerLine.indexOf(':');
      if (colonIdx > -1) {
        const key = headerLine.slice(0, colonIdx).trim();
        const value = headerLine.slice(colonIdx + 1).trim();
        headers[key] = value;
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      data = tokens[++i] || '';
      if (method === 'GET') method = 'POST';
    } else if (token === '-u' || token === '--user') {
      auth = tokens[++i] || '';
    } else if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  if (!url) {
    throw new Error('No URL found in the cURL command.');
  }

  return { method, url, headers, data, auth };
}

export function toFetch({ method, url, headers, data, auth }) {
  const reqHeaders = { ...headers };
  if (auth && !reqHeaders['Authorization']) {
    reqHeaders['Authorization'] = `Basic ${btoa(auth)}`;
  }

  const options = { method };
  if (Object.keys(reqHeaders).length > 0) {
    options.headers = reqHeaders;
  }
  if (data) {
    options.body = data;
  }

  return `// JavaScript (Fetch API)
const response = await fetch("${url}", {
  method: "${method}",
${Object.keys(reqHeaders).length ? `  headers: ${JSON.stringify(reqHeaders, null, 4).replace(/\n/g, '\n  ')},\n` : ''}${data ? `  body: ${JSON.stringify(data)}\n` : ''}});
const result = await response.json();
console.log(result);`;
}

export function toAxios({ method, url, headers, data, auth }) {
  const reqHeaders = { ...headers };
  if (auth && !reqHeaders['Authorization']) {
    reqHeaders['Authorization'] = `Basic ${btoa(auth)}`;
  }

  const methodLower = method.toLowerCase();
  return `// JavaScript (Axios)
import axios from 'axios';

const { data } = await axios({
  method: '${methodLower}',
  url: '${url}',
${Object.keys(reqHeaders).length ? `  headers: ${JSON.stringify(reqHeaders, null, 4).replace(/\n/g, '\n  ')},\n` : ''}${data ? `  data: ${data.startsWith('{') ? data : JSON.stringify(data)}\n` : ''}});
console.log(data);`;
}

export function toPython({ method, url, headers, data, auth }) {
  let code = `import requests\n\nurl = "${url}"\n`;
  if (Object.keys(headers).length > 0) {
    code += `headers = ${JSON.stringify(headers, null, 4)}\n`;
  }
  if (auth) {
    const [user, pass] = auth.split(':');
    code += `auth = ("${user || ''}", "${pass || ''}")\n`;
  }
  if (data) {
    try {
      const parsed = JSON.parse(data);
      code += `json_data = ${JSON.stringify(parsed, null, 4)}\n`;
    } catch {
      code += `data = ${JSON.stringify(data)}\n`;
    }
  }

  code += `\nresponse = requests.${method.toLowerCase()}(\n    url,\n`;
  if (Object.keys(headers).length > 0) code += `    headers=headers,\n`;
  if (auth) code += `    auth=auth,\n`;
  if (data) {
    code += data.startsWith('{') ? `    json=json_data,\n` : `    data=data,\n`;
  }
  code += `)\nprint(response.status_code)\nprint(response.json())`;
  return code;
}

export function toGo({ method, url, headers, data }) {
  return `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
)

func main() {
${data ? `    body := []byte(\`${data.replace(/`/g, '\\`')}\`)\n    req, err := http.NewRequest("${method}", "${url}", bytes.NewBuffer(body))\n` : `    req, err := http.NewRequest("${method}", "${url}", nil)\n`}    if err != nil {
        panic(err)
    }

${Object.entries(headers).map(([k, v]) => `    req.Header.Set("${k}", "${v}")`).join('\n')}

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)
    fmt.Println(string(respBody))
}`;
}

export function toRust({ method, url, headers, data }) {
  return `// Rust (reqwest)
use reqwest::header::HeaderMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
${Object.entries(headers).map(([k, v]) => `    headers.insert("${k}", "${v}".parse()?);`).join('\n')}

    let response = client.${method.toLowerCase()}("${url}")
        .headers(headers)
${data ? `        .body(\`${data.replace(/`/g, '\\`')}\`)\n` : ''}        .send()
        .await?
        .text()
        .await?;

    println!("{}", response);
    Ok(())
}`;
}
