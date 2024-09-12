let spec = '';

let result: object | false;

function parseJSON(json: string, throwError = false): object | false {
  try {
    return JSON.parse(json);
  } catch (e) {
    if (e instanceof Error && throwError) {
      console.error(e.message);
    }

    // Invalid JSON, need fix
    return false;
  }
}

function printJSON(json: object): void {
  console.log(JSON.stringify(json, undefined, 2));
  process.exit(0);
}

result = parseJSON(spec);
if (result) {
  printJSON(result);
}

// Fix 1: quote values
const step1 = new RegExp(/("values?":\s?"\{)([\w",:{}[\]\-℃%]+)(\}"\s?},?)/g);
spec = spec.replaceAll(step1, (_substring, group1: string, group2: string, group3: string) => {
  return `${group1}${group2.replaceAll('"', '\\"')}${group3}`;
});

result = parseJSON(spec);
if (result) {
  printJSON(result);
}

console.error('Fix failed...', spec);
parseJSON(spec, true);
