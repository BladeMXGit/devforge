/**
 * DevForge - JSON Studio & Code Generator
 * Formatter, validator, and instant converter to TypeScript, Python dataclasses, and Go structs.
 */

export function formatJSON(input, indent = 2) {
  if (!input || !input.trim()) return '';
  const parsed = JSON.parse(input);
  const space = indent === 'tab' ? '\t' : Number(indent);
  return JSON.stringify(parsed, null, space);
}

export function minifyJSON(input) {
  if (!input || !input.trim()) return '';
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function getJSONStats(input) {
  try {
    const parsed = JSON.parse(input);
    const bytes = new Blob([input]).size;
    let keysCount = 0;

    function countKeys(obj) {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach(countKeys);
        } else {
          keysCount += Object.keys(obj).length;
          Object.values(obj).forEach(countKeys);
        }
      }
    }
    countKeys(parsed);

    return {
      isValid: true,
      bytes,
      formattedSize: bytes > 1024 ? `${(bytes / 1024).toFixed(2)} KB` : `${bytes} B`,
      keysCount,
      type: Array.isArray(parsed) ? 'Array' : typeof parsed
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message
    };
  }
}

// Convert JSON to TypeScript Interface
export function jsonToTypeScript(jsonStr, rootName = 'RootObject') {
  const parsed = JSON.parse(jsonStr);
  const interfaces = [];

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getType(val, key = '') {
    if (val === null) return 'any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const itemType = getType(val[0], key ? `${key}Item` : 'Item');
      return `${itemType}[]`;
    }
    if (typeof val === 'object') {
      const subName = capitalize(key || 'SubObject');
      generateInterface(val, subName);
      return subName;
    }
    return typeof val;
  }

  function generateInterface(obj, name) {
    if (Array.isArray(obj)) {
      if (obj.length > 0 && typeof obj[0] === 'object') {
        generateInterface(obj[0], name);
      }
      return;
    }

    const lines = [`export interface ${name} {`];
    for (const [k, v] of Object.entries(obj)) {
      const type = getType(v, k);
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      lines.push(`  ${safeKey}: ${type};`);
    }
    lines.push('}');
    interfaces.unshift(lines.join('\n'));
  }

  generateInterface(parsed, rootName);
  return interfaces.join('\n\n');
}

// Convert JSON to Python Dataclass
export function jsonToPython(jsonStr, rootName = 'RootModel') {
  const parsed = JSON.parse(jsonStr);
  const classes = [];

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getType(val, key = '') {
    if (val === null) return 'Optional[Any]';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'string') return 'str';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]';
      const itemType = getType(val[0], key ? `${key}Item` : 'Item');
      return `List[${itemType}]`;
    }
    if (typeof val === 'object') {
      const subName = capitalize(key || 'SubModel');
      generateClass(val, subName);
      return subName;
    }
    return 'Any';
  }

  function generateClass(obj, name) {
    if (Array.isArray(obj)) {
      if (obj.length > 0 && typeof obj[0] === 'object') {
        generateClass(obj[0], name);
      }
      return;
    }

    const lines = ['@dataclass', `class ${name}:`];
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      lines.push('    pass');
    } else {
      for (const [k, v] of entries) {
        const type = getType(v, k);
        const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : `_${k}`;
        lines.push(`    ${safeKey}: ${type}`);
      }
    }
    classes.unshift(lines.join('\n'));
  }

  generateClass(parsed, rootName);
  return `from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n` + classes.join('\n\n');
}

// Convert JSON to Go Struct
export function jsonToGo(jsonStr, rootName = 'Root') {
  const parsed = JSON.parse(jsonStr);
  const structs = [];

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function toPascalCase(str) {
    return str.split(/[^a-zA-Z0-9]/).filter(Boolean).map(capitalize).join('') || 'Field';
  }

  function getType(val, key = '') {
    if (val === null) return 'interface{}';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float64';
    if (typeof val === 'string') return 'string';
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]interface{}';
      const itemType = getType(val[0], key ? `${key}Item` : 'Item');
      return `[]${itemType}`;
    }
    if (typeof val === 'object') {
      const subName = capitalize(key || 'SubStruct');
      generateStruct(val, subName);
      return subName;
    }
    return 'interface{}';
  }

  function generateStruct(obj, name) {
    if (Array.isArray(obj)) {
      if (obj.length > 0 && typeof obj[0] === 'object') {
        generateStruct(obj[0], name);
      }
      return;
    }

    const lines = [`type ${name} struct {`];
    for (const [k, v] of Object.entries(obj)) {
      const fieldName = toPascalCase(k);
      const type = getType(v, k);
      lines.push(`\t${fieldName} ${type} \`json:"${k}"\``);
    }
    lines.push('}');
    structs.unshift(lines.join('\n'));
  }

  generateStruct(parsed, rootName);
  return structs.join('\n\n');
}
