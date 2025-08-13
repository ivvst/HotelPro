import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'trim', standalone: true })
export class TrimPipe implements PipeTransform { transform(v: string | null | undefined) { return (v ?? '').trim(); } }