import { KeyboardEvent } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Chuyển đổi thời gian từ múi giờ khác về giờ Việt Nam (Asia/Ho_Chi_Minh)
 * @param {string} date - Chuỗi thời gian cần chuyển đổi
 * @param {string} fromTimeZone - Múi giờ nguồn (ví dụ: "America/New_York")
 * @returns {string} - Thời gian sau khi chuyển đổi sang múi giờ Việt Nam
 */
// export const formatTimeVN = (date: string): string => {
//   if (!dayjs(date).isValid()) return '';
//   return dayjs.tz(date, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
// };

export function formatTimeVN(utcTime: any) {
  if (!utcTime) return '';

  try {
    let date = new Date(utcTime);
    if (isNaN(date.getTime())) return '';

    // Cộng thêm 7 giờ đúng cách
    date.setUTCHours(date.getUTCHours() + 7);

    let day = String(date.getUTCDate()).padStart(2, '0');
    let month = String(date.getUTCMonth() + 1).padStart(2, '0');
    let year = date.getUTCFullYear();

    let hours = String(date.getUTCHours()).padStart(2, '0');
    let minutes = String(date.getUTCMinutes()).padStart(2, '0');
    let seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return '';
  }
}

const optionsLocalString = {
  useGrouping: true,
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
  decimalSeparator: '.',
  groupingSeparator: ',',
};

export function formatNumber(
  unformatted: number | string | undefined,
  showDigits = 2
) {
  // get fraction digits for small number
  if (!unformatted) return 0;
  const optionsLocalStringDigit = {
    useGrouping: true,
    maximumFractionDigits: showDigits,
    minimumFractionDigits: 0,
    decimalSeparator: '.',
    groupingSeparator: ',',
  };

  const absNumber = Math.abs(Number(unformatted));
  if (absNumber > 0) {
    const digits = Math.ceil(Math.log10(1 / absNumber));
    if (digits < 3) {
      // optionsLocalString fix error decimalSeparator = ',' on mobile
      return Number(unformatted).toLocaleString(
        'en-US',
        optionsLocalStringDigit
      );
    }
    return Number(unformatted).toFixed(showDigits);
  } else {
    return 0;
  }
}

const numericRegex = /[0-9]/;
const pattern = /^[a-zA-Z0-9]+$/;
export const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
  const key = e.key;

  if (
    !numericRegex.test(key) &&
    key !== 'Backspace' &&
    key !== 'Delete' &&
    key !== 'ArrowLeft' &&
    key !== 'ArrowRight'
  ) {
    e.preventDefault();
  }
};
export const onKeyPressNumberCharacter = (
  e: KeyboardEvent<HTMLInputElement>
) => {
  const key = e.key;

  if (
    !pattern.test(key) &&
    key !== 'Backspace' &&
    key !== 'Delete' &&
    key !== 'ArrowLeft' &&
    key !== 'ArrowRight'
  ) {
    e.preventDefault();
  }
};

export function formatStringToNumber(str: any) {
  if (typeof str === 'string') {
    let integerPart = str.split('.')[0];
    return Number(integerPart);
  }
}

export function toCustomString(obj: any): string {
  const entries = Object.entries(obj).map(([key, val]) => {
    let value = val;
    if (typeof val === 'string') value = `"${val}"`;
    else if (typeof val === 'boolean') value = val.toString();
    else if (val === null) value = 'null';
    return `"${key}":${value}`;
  });
  return `{${entries.join(',')}}`;
}

export function formatTime(dateString: any) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

export function formatNumberShowDigit(
  unformatted: number | string | null | undefined,
  showDigits = 3
) {
  // get fraction digits for small number
  if (!unformatted) return 0;
  const optionsLocalStringDigit = {
    useGrouping: true,
    maximumFractionDigits: showDigits,
    minimumFractionDigits: 0,
    decimalSeparator: '.',
    groupingSeparator: ',',
  };

  const absNumber = Math.abs(Number(unformatted));
  if (absNumber > 0) {
    const digits = Math.ceil(Math.log10(1 / absNumber));
    if (digits < 3) {
      // optionsLocalString fix error decimalSeparator = ',' on mobile
      return Number(unformatted).toLocaleString(
        'en-US',
        optionsLocalStringDigit
      );
    }
    return Number(unformatted).toFixed(showDigits);
  } else {
    return 0;
  }
}

export function truncateString(str: any) {
  if (str?.length >= 10) {
    return str.slice(0, 10).concat('...');
  }
  return str;
}
