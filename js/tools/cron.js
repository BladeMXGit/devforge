/**
 * DevForge - Cron Expression Visualizer & Explainer
 * Translates standard 5-part cron syntax to plain English and Spanish, and calculates next runs.
 */

export const CRON_PRESETS = [
  { name: 'Every minute', expr: '* * * * *' },
  { name: 'Every 15 minutes', expr: '*/15 * * * *' },
  { name: 'Every hour (:00)', expr: '0 * * * *' },
  { name: 'Every day at midnight', expr: '0 0 * * *' },
  { name: 'Every day at 9:00 AM', expr: '0 9 * * *' },
  { name: 'Mon-Fri at 8:30 AM', expr: '30 8 * * 1-5' },
  { name: 'First day of month', expr: '0 0 1 * *' }
];

export function explainCron(cronStr) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('A standard cron expression must contain exactly 5 fields (minute, hour, day, month, day-of-week).');
  }

  const [min, hour, dom, mon, dow] = parts;

  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthsEn = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Human description builder
  let descEn = '';
  let descEs = '';

  if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    descEn = 'Runs every single minute';
    descEs = 'Se ejecuta cada minuto';
  } else if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    const step = min.slice(2);
    descEn = `Runs every ${step} minutes`;
    descEs = `Se ejecuta cada ${step} minutos`;
  } else if (hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    descEn = `Runs at minute :${min.padStart(2, '0')} of every hour`;
    descEs = `Se ejecuta en el minuto :${min.padStart(2, '0')} de cada hora`;
  } else if (dom === '*' && mon === '*' && dow === '*') {
    descEn = `Runs daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    descEs = `Se ejecuta diariamente a las ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  } else if (dom === '*' && mon === '*' && dow.includes('-')) {
    descEn = `Runs on days ${dow} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    descEs = `Se ejecuta los días ${dow} a las ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  } else {
    descEn = `At ${hour.padStart(2, '0')}:${min.padStart(2, '0')}, on day ${dom} of month ${mon}, weekday ${dow}`;
    descEs = `A las ${hour.padStart(2, '0')}:${min.padStart(2, '0')}, el día ${dom} del mes ${mon}, día de semana ${dow}`;
  }

  return {
    descEn,
    descEs,
    fields: {
      minute: min,
      hour: hour,
      dayOfMonth: dom,
      month: mon,
      dayOfWeek: dow
    }
  };
}

// Calculate the next N upcoming occurrences
export function getNextOccurrences(cronStr, count = 5) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minPart, hourPart, domPart, monPart, dowPart] = parts;

  function matches(val, part) {
    if (part === '*') return true;
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2), 10);
      return val % step === 0;
    }
    if (part.includes(',')) {
      return part.split(',').some(p => matches(val, p));
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      return val >= start && val <= end;
    }
    return val === parseInt(part, 10);
  }

  const results = [];
  const current = new Date();
  // Move to the next full minute
  current.setSeconds(0);
  current.setMilliseconds(0);
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  while (results.length < count && iterations < 500000) {
    iterations++;
    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1; // 1-12
    const dow = current.getDay(); // 0-6

    if (
      matches(m, minPart) &&
      matches(h, hourPart) &&
      matches(dom, domPart) &&
      matches(mon, monPart) &&
      matches(dow, dowPart)
    ) {
      results.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}
