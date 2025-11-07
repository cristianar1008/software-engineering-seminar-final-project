import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
  pure: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value?: string | Date): string {
    if (!value) return '-';
    let d: Date;
    if (value instanceof Date) {
      d = value;
    } else {
      // Try ISO first
      const iso = new Date(value);
      if (!isNaN(iso.getTime())) {
        d = iso;
      } else {
        // Try dd/MM/yyyy
        const parts = value.split('/');
        if (parts.length === 3) {
          const [ddStr, mmStr, yyyyStr] = parts;
          const dd = Number(ddStr);
          const mm = Number(mmStr);
          const yyyy = Number(yyyyStr);
          if (this.isValidDMY(dd, mm, yyyy)) {
            d = new Date(Date.UTC(yyyy, mm - 1, dd));
          } else {
            return '-';
          }
        } else {
          return '-';
        }
      }
    }
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  private isValidDMY(dd: number, mm: number, yyyy: number): boolean {
    if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return false;
    if (yyyy < 1900 || yyyy > 3000) return false;
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    // Basic month day check
    const maxDays = [31, this.isLeap(yyyy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mm - 1];
    return dd <= maxDays;
  }

  private isLeap(y: number): boolean {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }
}